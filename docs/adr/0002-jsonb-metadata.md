# ADR-0002 — Use JSONB for `instruments.metadata` column

- Status: Accepted
- Date: 2026-06-02
- Deciders: ReconX Engineering Team

## Context

Financial instruments across different asset classes (Equities, Fixed Income, FX, Commodities, Derivatives) possess heterogeneous reference attributes. For instance, Fixed Income requires `tenor` and `couponRate`; Equities require `sector` and `exchange`; FX requires `pair` and `market`; Derivatives require `underlying` and `expiryMonth`. Creating explicit relational columns for all asset-class-specific attributes leads to a sparse, wide table with 30+ nullable columns, requiring schema migration DDLs whenever new financial attributes are introduced.

## Decision

We will store non-core instrument attributes in a single `metadata` column of type `JSONB` on the `instruments` table, defaulting to `'{}'::JSONB NOT NULL`. Structural schema validation will be performed at the application tier via Spring Boot DTOs and Jackson annotations rather than rigid DDL constraints.

## Consequences

**Positive**
- **Schema Flexibility:** Supports new asset classes and metadata attributes without database migration DDLs or table locks.
- **Normalized Core Schema:** Keeps core `instruments` table lean (symbol, name, asset_class, currency, isin) for high-performance join operations.
- **Rich Document Queries:** Enables PostgreSQL JSON path navigation and containment filtering.

**Negative**
- Relational integrity and type-safety for metadata attributes shift from the database engine to application code.
- Higher storage footprint per row compared to compact primitive column types.

---

### Prompt Used to Generate this ADR
```text
You are an enterprise software architect. Write an Architecture Decision Record
(ADR) in the Michael Nygard format (Title, Status, Context, Decision,
Consequences) for the following decision.

System: ReconX, a near-prod trade reconciliation platform.
Stack: PostgreSQL 16, Spring Boot 3, Kafka, React.
Scale: ~50,000 trades/day, 50,000 instrument master records across 5 asset classes.

Decision to record: Add a JSONB metadata column to instruments for asset-class specific attributes.

Alternatives we considered: Entity-Attribute-Value (EAV) tables, Sparse table with 30+ nullable columns, Separate instrument table per asset class.

Constraints / forces: Rapid addition of new asset classes, zero-downtime schema evolution, high query performance.
```
