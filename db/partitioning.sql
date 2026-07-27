-- ============================================================================
-- TICKET-ADV007 — Convert trades to monthly range-partitioned table (PostgreSQL)
--
-- WHAT:    trades parent table partitioned BY RANGE on trade_date with child
--          partitions for April 2026 through July 2026 plus trades_default.
-- WHY:     Partitioning by trade_date allows EOD reconciliation queries and
--          matview refreshes to scan single partitions rather than full table.
-- ============================================================================

-- 1. Rename existing unpartitioned table if migrating
ALTER TABLE IF EXISTS trades RENAME TO trades_legacy;

-- 2. Create partitioned parent table
CREATE TABLE trades (
    id              BIGSERIAL,
    trade_ref       VARCHAR(30)   NOT NULL,
    instrument_id   BIGINT        NOT NULL REFERENCES instruments(id),
    counterparty_id BIGINT        NOT NULL REFERENCES counterparties(id),
    asset_class     VARCHAR(20)   NOT NULL,
    side            VARCHAR(4)    NOT NULL,
    quantity        NUMERIC(18,4) NOT NULL,
    price           NUMERIC(18,4) NOT NULL,
    trade_date      DATE          NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    modified_at     TIMESTAMPTZ,
    PRIMARY KEY (id, trade_date)
) PARTITION BY RANGE (trade_date);

-- 3. Create indices on parent table (Postgres automatically propagates to child partitions)
CREATE INDEX idx_trades_trade_date ON trades (trade_date);
CREATE INDEX idx_trades_status ON trades (status);
CREATE INDEX idx_trades_instrument_id ON trades (instrument_id);
CREATE INDEX idx_trades_counterparty_id ON trades (counterparty_id);

-- 4. Create monthly child partitions for active 4-month window
CREATE TABLE trades_y2026m04 PARTITION OF trades
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE trades_y2026m05 PARTITION OF trades
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE trades_y2026m06 PARTITION OF trades
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE trades_y2026m07 PARTITION OF trades
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- 5. Catch-all default partition to prevent write failures for out-of-window trades
CREATE TABLE trades_default PARTITION OF trades DEFAULT;

-- 6. Migrate data from legacy table if exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'trades_legacy') THEN
        INSERT INTO trades SELECT * FROM trades_legacy;
        DROP TABLE trades_legacy;
    END IF;
END $$;

-- 7. Pruning verification query:
-- EXPLAIN ANALYZE SELECT * FROM trades WHERE trade_date = '2026-06-15';
