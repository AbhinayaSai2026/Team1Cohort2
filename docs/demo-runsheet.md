# ReconX — Demo Runsheet (20-minute Slot)

TICKET-ADV163 — 20-minute rehearsal runsheet with timestamped screen switches and fallback notes.

## Timing Breakdown

| Time | Stage | Action & Screen Switch | Owner | Fallback Note |
| :--- | :--- | :--- | :--- | :--- |
| **0:00 - 3:00** | Context & Architecture | Slides 1-4: Title, Problem, Architecture, Tech Stack. Walk C4 container diagram. | Team Lead | Slide deck PDF |
| **3:00 - 4:00** | Live Demo: Auth | Switch to live browser (`http://localhost:5173`). Login as trader. Show JWT response. | Lead / FE | Use saved curl token |
| **4:00 - 5:30** | Live Demo: Trade | Post a trade via the UI/Swagger (`http://localhost:8081/api/swagger-ui.html`). Show 201 Created. | Backend Lead | Post via curl script |
| **5:30 - 7:00** | Live Demo: Kafka | Switch to Kafdrop (`http://localhost:9000`) -> `trade-events` topic -> show JSON message body. | DevOps / BE | `kafka-console-consumer` in terminal |
| **7:00 - 8:30** | Live Demo: Observability | Switch to Grafana (`http://localhost:3000`) -> ReconX Dashboard -> request rate & trade count panels. | DevOps | Pre-saved Grafana PNGs |
| **8:30 - 11:00** | Live Demo: Database Audit | Execute `psql` command to confirm `audit_log` row in Postgres (`reconx-postgres`). | Backend Lead | `SELECT * FROM audit_log ORDER BY id DESC LIMIT 1;` |
| **11:00 - 16:00** | Code Walkthrough | 1. `TradeController.java` (BE 1)<br>2. `ReconciliationEngine.java` / Kafka Consumer (BE 2)<br>3. React / SSE feed (FE Lead) | Whole Team | Code snippets pre-opened in IDE |
| **16:00 - 20:00** | Team Learnings & Q&A | Whole team contributions. Lead routes questions to subject matter owners. | Whole Team | - |

## Rehearsal Log
- **Rehearsal 1 (Chaos Monkey):** Simulated network drop & JWT expiry recovery.
- **Rehearsal 2 (Instructor Q&A):** Passed strict architectural and concurrency Q&A bank.
