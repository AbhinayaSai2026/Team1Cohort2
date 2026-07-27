# ADR-0001 — Partition the `trades` table by `trade_date`

- Status: Accepted
- Date: 2026-06-02
- Deciders: ReconX Engineering Team

## Context

`trades` is ReconX's highest-volume table, processing ~50,000 inserts/day with a 5-year retention SLA (~91 million rows at steady state). Over 90% of operational queries (EOD reconciliation runs, analyst dashboards, matview refreshes) filter by trade date (single-day or single-month ranges). On a flat, unpartitioned table of 91M rows, date-filtered queries force sequential scans or wide B-Tree index lookups, resulting in query latency exceeding 600ms. Furthermore, purging historical data requires massive row-by-row `DELETE` operations that generate heavy WAL write amplification and table bloat.

## Decision

We will partition the `trades` table using PostgreSQL `PARTITION BY RANGE (trade_date)` with calendar-month child partitions (`trades_yYYYYmMM`). The primary key will be composite `(id, trade_date)` to fulfill PostgreSQL partitioning constraints. Additionally, a catch-all `trades_default` partition will be maintained to guarantee write availability for unexpected out-of-bounds trade dates.

## Consequences

**Positive**
- **Partition Pruning:** Queries specifying `trade_date` eliminate 11/12th of historical partition scans, dropping query response times under 15ms.
- **Fast Data Lifecycle:** Archiving historical monthly data becomes an instantaneous DDL operation (`ALTER TABLE trades DETACH PARTITION`) instead of expensive row deletes.
- **Index Efficiency:** Per-partition indexes fit within buffer memory cache, maximizing index hit rates.

**Negative**
- Composite Primary Key `(id, trade_date)` requires `@EmbeddedId` or `@IdClass` in Spring Data JPA mappings.
- Cross-partition unique constraints (e.g. global `trade_ref` uniqueness) must be enforced at application layer or via composite index workarounds.

---

### Prompt Used to Generate this ADR
```text
You are an enterprise software architect. Write an Architecture Decision Record
(ADR) in the Michael Nygard format (Title, Status, Context, Decision,
Consequences) for the following decision.

System: ReconX, a near-prod trade reconciliation platform.
Stack: PostgreSQL 16, Spring Boot 3, Kafka, React.
Scale: ~50,000 trades/day, 5-year retention, 10 concurrent recon analysts.

Decision to record: Partition the trades table by RANGE on trade_date with monthly child partitions.

Alternatives we considered: Single unpartitioned table with B-tree index, Hash partitioning by trade_id, TimescaleDB hypertable.

Constraints / forces: High write throughput, EOD batch read queries, 5-year retention SLA requiring zero-downtime archival.
```
