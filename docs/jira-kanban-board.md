# TICKET-ADV016 — ReconX Jira / GitHub Projects Board Setup

This document records the Agile project management structure, epics, workflow columns, field schemas, and individual exercise card definitions for Day 1 of the ReconX platform case study.

---

## 1. Epics Overview

The 17 Day-1 exercises are organized into three primary epics:

| Epic ID | Epic Name | Scope |
|---------|-----------|-------|
| **RECONX-E1** | Day 1: Architecture & Setup | TICKET-ADV001 to TICKET-ADV004 (GitHub, C4 Diagrams) |
| **RECONX-E2** | Day 1: Schema & Analytics | TICKET-ADV006 to TICKET-ADV011 (ERD, Partitioning, MatView, JSONB, Queries) |
| **RECONX-E3** | Day 1: Liquibase & Tooling | TICKET-ADV012 to TICKET-ADV017 (Liquibase, Rollback, Preconditions, ADRs, Board, Seed Data) |

---

## 2. Board Columns & Workflow

```
[ Backlog ] ──▶ [ To Do ] ──▶ [ In Progress ] ──▶ [ In Review (PR Open) ] ──▶ [ Done ]
```

---

## 3. Card Field Schema

Each ticket card on the project board contains the following structured attributes:
- **Exercise ID**: Matching codebase tag (e.g. `TICKET-ADV007`)
- **Estimate**: Fibonacci story points (`1`, `2`, `3`, `5`, `8`)
- **Owner**: Assigned team member handle
- **Linked PR**: PR link on GitHub
- **Acceptance Criteria**: Exact criteria from student guide

---

## 4. Day 1 Exercise Cards Catalog

| Ticket ID | Epic | Title | Estimate | Owner | Acceptance Criteria Summary |
|-----------|------|-------|----------|-------|-----------------------------|
| **TICKET-ADV001** | RECONX-E1 | Create GitHub repo with branch protection | 3 SP | @AbhinayaSai2026 | Private repo, main requires 2 approvals + Code Owners + status checks, direct push to main rejected. |
| **TICKET-ADV002** | RECONX-E2 | Design C4 Context diagram | 2 SP | @prajnabshettigar | `db/diagrams/c4-context.md` with 1 ReconX system box, 4 personas, 6 external systems. |
| **TICKET-ADV003** | RECONX-E1 | Design C4 Container diagram | 3 SP | @bvarshii | `db/diagrams/c4-container.md` showing 7 runtime containers inside ReconX boundary. |
| **TICKET-ADV004** | RECONX-E1 | Design C4 Component diagram | 3 SP | @ananyaatrri | `db/diagrams/c4-component.md` zooming into API container with ~13 Spring components. |
| **TICKET-ADV006** | RECONX-E2 | Design ER model (8 entities) | 3 SP | @prajnabshettigar | `db/erd.md` with 8 tables, PK/FK/UK, partition key & JSONB annotations. |
| **TICKET-ADV007** | RECONX-E2 | CREATE TABLE with monthly partitioning | 5 SP | @prajnabshettigar | `trades` RANGE-partitioned on `trade_date` with 4 child partitions + default. |
| **TICKET-ADV008** | RECONX-E2 | Materialised view `mv_daily_recon_summary` | 3 SP | @AbhinayaSai2026 | Mat view with unique index allowing `REFRESH MATERIALIZED VIEW CONCURRENTLY`. |
| **TICKET-ADV009** | RECONX-E2 | Add JSONB column to instruments | 3 SP | @AbhinayaSai2026 | `instruments.metadata` JSONB column backed by GIN index (`jsonb_path_ops`). |
| **TICKET-ADV010** | RECONX-E2 | Window Function: VWAP per instrument per day | 3 SP | @AbhinayaSai2026 | Query in `db/queries.sql` computing VWAP per instrument per day preserving row detail. |
| **TICKET-ADV011** | RECONX-E2 | Recursive CTE: trade lifecycle rollup | 5 SP | @AbhinayaSai2026 | Recursive CTE in `db/queries.sql` walking trade through lifecycle stages with guard. |
| **TICKET-ADV012** | RECONX-E3 | Liquibase master changelog | 3 SP | @AbhinayaSai2026 | `db.changelog-master.xml` included chapter files, `application.yml` wiring. |
| **TICKET-ADV013** | RECONX-E3 | Add rollback tags | 2 SP | @AbhinayaSai2026 | Reversible changesets with `<rollback>` blocks and `<tagDatabase>` release boundaries. |
| **TICKET-ADV014** | RECONX-E3 | Add preconditions | 2 SP | @AbhinayaSai2026 | Every changeset guarded by `<preConditions>` (`MARK_RAN`, `<dbms>`, `<sqlCheck>`). |
| **TICKET-ADV015** | RECONX-E3 | Use Claude to generate ADRs | 3 SP | @AbhinayaSai2026 | At least 3 ADRs under `docs/adr/` in Nygard format + prompt template in `README.md`. |
| **TICKET-ADV016** | RECONX-E3 | Set up Jira / Kanban with epics | 2 SP | @AbhinayaSai2026 | Board configured with 3 epics, 17 cards, fields, and workflow columns. |
| **TICKET-ADV017** | RECONX-E3 | Seed data: 10 counterparties, 50 instruments, 500 trades | 5 SP | @AbhinayaSai2026 | Seed data loaded (10 counterparties, 50 instruments, 500 trades over 4 partitions). |
