-- ============================================================================
-- TICKET-ADV017 — Deterministic Seed Data (PostgreSQL)
--
-- WHAT:    10 counterparties, 50 instruments (5 explicit + 45 generated),
--          500 trades spread across four monthly partitions (April–July 2026),
--          30 recon breaks, and 4 BCrypt users.
-- ============================================================================

-- 1. Counterparties (10 entities across 4 regions: NAMR, EMEA, APAC, LATAM)
INSERT INTO counterparties (id, name, lei_code, region) VALUES
  (1,  'Apex Brokers Inc',         '5493001ABCDE12345001', 'NAMR'),
  (2,  'Vertex Securities LLC',    '5493001ABCDE12345002', 'NAMR'),
  (3,  'Helix Capital Markets',    '5493001ABCDE12345003', 'APAC'),
  (4,  'Aurora Markets SA',        '5493001ABCDE12345004', 'LATAM'),
  (5,  'Borealis Trading GmbH',    '5493001ABCDE12345005', 'EMEA'),
  (6,  'Cascadia Investments PLC', '5493001ABCDE12345006', 'EMEA'),
  (7,  'Delphi Asset Management',  '5493001ABCDE12345007', 'EMEA'),
  (8,  'Equinox Securities Pty',   '5493001ABCDE12345008', 'APAC'),
  (9,  'Fjord Capital Partners',   '5493001ABCDE12345009', 'EMEA'),
  (10, 'Granite Hill Brokers',     '5493001ABCDE12345010', 'NAMR')
ON CONFLICT (id) DO NOTHING;

-- 2. Instruments (5 explicit + 45 generated = 50 total)
INSERT INTO instruments (id, symbol, name, asset_class, currency, isin, metadata) VALUES
  (1, 'SAP.DE', 'SAP SE',                'EQUITY',       'EUR', 'DE0007164600',
     '{"sector":"Technology","exchange":"XETR","issuer":{"name":"SAP SE","country":"DE"}}'::JSONB),
  (2, 'US10Y',  'US 10-Year Treasury',   'FIXED_INCOME', 'USD', 'US912828F622',
     '{"tenor":"10Y","issuer":{"name":"US Treasury","country":"US"}}'::JSONB),
  (3, 'EURUSD', 'Euro / US Dollar',      'FX',           'USD', NULL,
     '{"pair":["EUR","USD"],"market":"Spot"}'::JSONB),
  (4, 'XAU',    'Spot Gold',             'COMMODITY',    'USD', NULL,
     '{"unit":"troy ounce","purity":"0.9999"}'::JSONB),
  (5, 'CL_FUT', 'WTI Crude Oil Futures', 'DERIVATIVE',   'USD', NULL,
     '{"underlying":"WTI","contractSize":1000,"expiry":"2026-12"}'::JSONB)
ON CONFLICT (id) DO NOTHING;

-- Generate remaining 45 instruments
INSERT INTO instruments (id, symbol, name, asset_class, currency, isin, metadata)
SELECT
    g + 5                                                       AS id,
    'GEN' || LPAD(g::TEXT, 4, '0')                             AS symbol,
    'Generated Instrument ' || g                                AS name,
    (ARRAY['EQUITY','FIXED_INCOME','FX','COMMODITY','DERIVATIVE'])[1 + (g % 5)]
                                                                AS asset_class,
    (ARRAY['USD','EUR','GBP','JPY','CHF'])[1 + (g % 5)]         AS currency,
    'GEN' || LPAD(g::TEXT, 9, '0')                              AS isin,
    jsonb_build_object('seq', g, 'auto', true, 'sector', (ARRAY['Technology','Banking','Energy','Healthcare','Industrial'])[1 + (g % 5)])
                                                                AS metadata
FROM generate_series(1, 45) AS g
ON CONFLICT (id) DO NOTHING;

-- 3. Trades (500 trades evenly spread across April–July 2026 ~125/month)
INSERT INTO trades (id, trade_ref, instrument_id, counterparty_id, asset_class, side, quantity, price, trade_date, status)
SELECT
    n                                                           AS id,
    'TRD-2026-' || LPAD(n::TEXT, 6, '0')                        AS trade_ref,
    1 + (n % 50)                                                 AS instrument_id,
    1 + (n % 10)                                                 AS counterparty_id,
    (ARRAY['EQUITY','FIXED_INCOME','FX','COMMODITY','DERIVATIVE'])[1 + (n % 5)]
                                                                AS asset_class,
    (ARRAY['BUY','SELL'])[1 + (n % 2)]                           AS side,
    ROUND((100 + (n * 17) % 5000)::NUMERIC, 4)                  AS quantity,
    ROUND((10 + (n * 13) % 450)::NUMERIC, 4)                    AS price,
    DATE '2026-04-01' + (n % 120) * INTERVAL '1 day'             AS trade_date,
    (ARRAY['PENDING','MATCHED','UNMATCHED','DISPUTED','MATCHED','MATCHED'])[1 + (n % 6)]
                                                                AS status
FROM generate_series(1, 500) AS n
ON CONFLICT (id, trade_date) DO NOTHING;

-- 4. Settlements (300 settlement records for trades)
INSERT INTO settlements (id, trade_id, settlement_date, amount, status)
SELECT
    n                                                           AS id,
    n                                                           AS trade_id,
    DATE '2026-04-02' + (n % 120) * INTERVAL '1 day'             AS settlement_date,
    ROUND((100 + (n * 17) % 5000) * (10 + (n * 13) % 450)::NUMERIC, 4) AS amount,
    (ARRAY['SETTLED','PENDING','SETTLED','FAILED'])[1 + (n % 4)] AS status
FROM generate_series(1, 300) AS n
ON CONFLICT (id) DO NOTHING;

-- 5. Recon Breaks (30 open breaks for UNMATCHED/DISPUTED trades)
INSERT INTO recon_breaks (id, trade_id, discrepancy_type, status)
SELECT
    ROW_NUMBER() OVER (ORDER BY t.id)                            AS id,
    t.id                                                        AS trade_id,
    (ARRAY['PRICE_MISMATCH','QUANTITY_MISMATCH','DATE_MISMATCH'])[1 + (t.id % 3)]
                                                                AS discrepancy_type,
    'OPEN'                                                      AS status
FROM trades t
WHERE t.status IN ('UNMATCHED','DISPUTED')
LIMIT 30
ON CONFLICT (id) DO NOTHING;

-- 6. Initial System Users (BCrypt cost=10 hashed passwords)
INSERT INTO users (id, email, password_hash, role) VALUES
  (1, 'admin@db.com',  '$2y$10$L9iP3BfsBS2LbVJRfc86TuWnJvP.AohjX3PNLwdtjlZfyB7YSp87C', 'ADMIN'),
  (2, 'trader@db.com', '$2y$10$LIpkayi0QDWyVguPtEQbkOATM7PTnMKFDNq47K92TUx2LHTBFQf1i', 'TRADER'),
  (3, 'viewer@db.com', '$2y$10$gC8J5Tzr15p4V6BgbbEFGOEb4VWM4YUOAdKEeyFlXtEvYolYblCVC', 'VIEWER'),
  (4, 'recon@db.com',  '$2y$10$UVYhlvPX38zSdPhY6bz4ee453bh6gXp9guhAfV5IU2SjcWPm0eWKq', 'RECON_ANALYST')
ON CONFLICT (id) DO NOTHING;

-- 7. Verification / Sanity check queries
SELECT COUNT(*) AS counterparties_count FROM counterparties; -- Expect 10
SELECT COUNT(*) AS instruments_count    FROM instruments;    -- Expect 50
SELECT COUNT(*) AS trades_count         FROM trades;         -- Expect 500
SELECT COUNT(*) AS settlements_count    FROM settlements;    -- Expect 300
SELECT COUNT(*) AS breaks_count         FROM recon_breaks;   -- Expect 30
SELECT COUNT(*) AS users_count          FROM users;          -- Expect 4

-- Verify partition distribution:
SELECT
    DATE_TRUNC('month', trade_date)::DATE AS partition_month,
    COUNT(*) AS trade_count
FROM trades
GROUP BY 1
ORDER BY 1;
