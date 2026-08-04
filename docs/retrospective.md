# ReconX — Team1Cohort2 — Retrospective

TICKET-ADV165 — Retrospective on technical execution, team dynamics, and lessons learned.

## What Worked?
- Multi-stage Docker builds reduced image footprints to < 250 MB.
- Automated Liquibase migrations on container boot ensured zero-schema-drift between local UAT and Docker environment.
- PromQL + Grafana dashboard provisioning gave immediate visibility into trade throughput, break rates, and JVM heap.
- Event-driven Kafka decoupling allowed seamless asynchronous trade processing and audit logging.

## What Didn't?
- Initial Maven build targeted Java 21/25 which caused release version mismatches on local environments with Java 17; resolved via unified Docker JDK environment.
- Spring Security RBAC and JWT filter chain required careful configuration for Actuator and Swagger endpoints.

## What Would You Change?
- Begin multi-stage Docker containerization on Day 8 to test containerized networking earlier.
- Add additional unit tests around negative paths to reach 85%+ JaCoCo line coverage faster.

## What Surprised You?
- The efficiency of Grafana provisioning for automatic dashboard deployment.
- How fast k6 load testing with 200 VUs identifies container resource limits.

## Technical Notes for the Next Cohort
- Ensure Docker container names match the hostnames in `docker-compose.yml` (`postgres`, `kafka`, `backend`).
- Always check `depends_on: {condition: service_healthy}` to ensure database migrations run before backend initialization.

## Team Roster
- **Team Lead:** Abhinaya Sai
- **Backend:** Team1 Cohort2 Developers
- **Frontend:** Team1 Cohort2 Developers
- **DevOps/CI:** Team1 Cohort2 Developers
