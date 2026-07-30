# ReconX Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the ReconX Platform, formatted according to the **Michael Nygard** template (Title, Status, Context, Decision, Consequences).

## ADR Creation Prompt Template

When generating a new ADR using AI (e.g. Claude), use the following standardized prompt template:

```text
You are an enterprise software architect. Write an Architecture Decision Record
(ADR) in the Michael Nygard format (Title, Status, Context, Decision,
Consequences) for the following decision.

System: ReconX, a near-prod trade reconciliation platform.
Stack: PostgreSQL 16, Spring Boot 3, Kafka, React.
Scale: ~50,000 trades/day, 5-year retention, 10 concurrent recon analysts.

Decision to record: <ONE LINE DESCRIBING THE DECISION>

Alternatives we considered: <LIST 2-3 ALTERNATIVES>

Constraints / forces: <LIST 2-3 CONSTRAINTS>

Format: Markdown, Nygard 5-section template, no fluff. Keep under 300 words.
Include a "Status: Accepted | Date: <YYYY-MM-DD>" header line.
```

## Index of ADRs

| ADR ID | Title | Status | Date |
|--------|-------|--------|------|
| [ADR-0001](0001-partition-trades-by-date.md) | Partition the `trades` table by `trade_date` | Accepted | 2026-06-02 |
| [ADR-0002](0002-jsonb-metadata.md) | Use JSONB for `instruments.metadata` column | Accepted | 2026-06-02 |
| [ADR-0003](0003-gin-over-btree.md) | Use GIN index (`jsonb_path_ops`) for JSONB containment | Accepted | 2026-06-02 |
