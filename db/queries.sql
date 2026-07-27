-- ============================================================================
-- ReconX Standalone Analytical & Operational SQL Queries
-- ============================================================================

-- ============================================================================
-- TICKET-ADV008 — Materialised View Refresh (Concurrent Execution)
--
-- WHAT:    Concurrent refresh of mv_daily_recon_summary without blocking dashboard reads.
-- REQUIRE: uq_mv_daily_recon_summary index must exist on the materialized view.
-- ============================================================================
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_recon_summary;

-- Query materialized view summary statistics:
SELECT
    trade_date,
    total_trades,
    matched_trades,
    break_trades,
    total_notional,
    ROUND((matched_trades::NUMERIC / NULLIF(total_trades, 0)) * 100, 2) AS match_rate_pct
FROM mv_daily_recon_summary
ORDER BY trade_date DESC;


-- ============================================================================
-- TICKET-ADV009 — JSONB Containment & Extraction Queries
--
-- WHAT:    Queries leveraging GIN index (jsonb_path_ops) on instruments.metadata.
-- ============================================================================

-- 1. Containment search (uses GIN index idx_instruments_metadata_gin):
SELECT id, symbol, name, asset_class, metadata->>'sector' AS sector
FROM instruments
WHERE metadata @> '{"sector": "Technology"}';

-- 2. Extract nested attributes:
SELECT symbol, metadata->'issuer'->>'country' AS issuer_country
FROM instruments
WHERE metadata ? 'issuer';

-- 3. Array membership check:
SELECT symbol, metadata->'tags' AS tags
FROM instruments
WHERE metadata->'tags' ? 'DAX40';


-- ============================================================================
-- TICKET-ADV010 — Window Function: VWAP per Instrument per Day
--
-- WHAT:    Calculates Volume-Weighted Average Price (VWAP) per (instrument_id, trade_date)
--          partition while preserving row-level detail for each trade.
-- WHY:     Used by reconciliation engine to detect price anomaly breaks.
-- ============================================================================
SELECT
    t.id                                                       AS trade_id,
    t.trade_ref,
    t.instrument_id,
    i.symbol,
    t.counterparty_id,
    t.trade_date,
    t.quantity,
    t.price,
    ROUND((t.quantity * t.price)::NUMERIC, 2)                  AS trade_notional,
    -- VWAP calculation per instrument per day:
    ROUND((SUM(t.price * t.quantity) OVER (PARTITION BY t.instrument_id, t.trade_date)
        / NULLIF(SUM(t.quantity) OVER (PARTITION BY t.instrument_id, t.trade_date), 0))::NUMERIC, 4)
                                                               AS vwap,
    -- Difference between execution price and VWAP:
    ROUND((t.price - (SUM(t.price * t.quantity) OVER (PARTITION BY t.instrument_id, t.trade_date)
        / NULLIF(SUM(t.quantity) OVER (PARTITION BY t.instrument_id, t.trade_date), 0)))::NUMERIC, 4)
                                                               AS price_variance_from_vwap,
    -- Sequential trade number within instrument-day partition:
    ROW_NUMBER() OVER (PARTITION BY t.instrument_id, t.trade_date ORDER BY t.created_at)
                                                               AS trade_sequence,
    -- Running cumulative quantity for the partition:
    SUM(t.quantity) OVER (PARTITION BY t.instrument_id, t.trade_date ORDER BY t.created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)      AS cumulative_quantity
FROM trades t
JOIN instruments i ON i.id = t.instrument_id
WHERE t.deleted_at IS NULL
ORDER BY t.trade_date DESC, t.instrument_id, t.created_at;


-- ============================================================================
-- TICKET-ADV011 — Recursive CTE: Trade Lifecycle Rollup
--
-- WHAT:    Walks trades through lifecycle stages (EXECUTION -> CONFIRMATION -> SETTLEMENT -> RECONCILED)
--          and emits structured lifecycle state progression per trade.
-- WHY:     Auditing and event-sourcing reconstruction for trade history.
-- ============================================================================
WITH RECURSIVE trade_lifecycle AS (
    -- Anchor member: Stage 1 (EXECUTION)
    SELECT
        t.id                                                   AS trade_id,
        t.trade_ref,
        1                                                      AS step,
        'EXECUTED'                                             AS stage_name,
        t.created_at                                           AS event_ts,
        'Trade executed at price $' || t.price || ' qty ' || t.quantity AS event_detail
    FROM trades t
    WHERE t.deleted_at IS NULL

    UNION ALL

    -- Recursive member: Stages 2 through 4
    SELECT
        tl.trade_id,
        tl.trade_ref,
        tl.step + 1                                            AS step,
        CASE tl.step
            WHEN 1 THEN 'CONFIRMED'
            WHEN 2 THEN 'SETTLED'
            WHEN 3 THEN 'RECONCILED'
        END                                                    AS stage_name,
        COALESCE(s.settlement_date::TIMESTAMP, tl.event_ts + INTERVAL '1 hour')
                                                               AS event_ts,
        COALESCE('Settlement status: ' || s.status, 'Matched in reconciliation')
                                                               AS event_detail
    FROM trade_lifecycle tl
    LEFT JOIN settlements s ON s.trade_id = tl.trade_id
    WHERE tl.step < 4                                          -- Termination Guard to prevent infinite recursion
)
SELECT
    trade_id,
    trade_ref,
    step,
    stage_name,
    event_ts,
    event_detail
FROM trade_lifecycle
ORDER BY trade_id, step;
