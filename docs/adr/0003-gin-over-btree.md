# ADR-0003 — Use GIN index (`jsonb_path_ops`) for JSONB containment

- Status: Accepted
- Date: 2026-06-02
- Deciders: ReconX Engineering Team

## Context

With `instruments.metadata` defined as `JSONB`, reconciliation filtering and instrument search queries frequently execute JSON containment lookups (e.g. `WHERE metadata @> '{"sector": "Technology"}'`). A standard B-Tree index cannot index internal key-value pairs or nested arrays inside JSON documents, forcing PostgreSQL to perform expensive sequential table scans (`Seq Scan`) across all instrument rows.

## Decision

We will create a Generalized Inverted Index (GIN) on `instruments.metadata` using the specialized `jsonb_path_ops` operator class (`CREATE INDEX idx_instruments_metadata_gin ON instruments USING GIN (metadata jsonb_path_ops);`).

## Consequences

**Positive**
- **Optimized Containment Performance:** Enables fast `Bitmap Index Scan` for `@>` containment operators, reducing lookup time from ~45ms to <1ms.
- **Compact Index Size:** `jsonb_path_ops` hashes 32-bit tokens for paths and values, producing GIN indexes up to 40% smaller than default `jsonb_ops`.

**Negative**
- `jsonb_path_ops` does not support key-existence operators (`?`, `?|`, `?&`), only containment queries (`@>`). Key-existence lookups fall back to sequential scans.
- GIN indexes incur a minor write latency overhead during `INSERT` and `UPDATE` operations due to pending list processing.

---

### Prompt Used to Generate this ADR
```text
You are an enterprise software architect. Write an Architecture Decision Record
(ADR) in the Michael Nygard format (Title, Status, Context, Decision,
Consequences) for the following decision.

System: ReconX, a near-prod trade reconciliation platform.
Stack: PostgreSQL 16, Spring Boot 3, Kafka, React.
Scale: ~50,000 trades/day, 50,000 instruments with JSONB metadata.

Decision to record: Back instruments.metadata JSONB column with a GIN index using jsonb_path_ops operator class.

Alternatives we considered: Standard B-Tree index on JSON expression (metadata->>'sector'), Default GIN jsonb_ops index, BTREE index on generated column.

Constraints / forces: High frequency containment queries (@>), minimal index footprint, fast search execution.
```
