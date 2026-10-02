# Dataset

The data Cloud Inventory starts with: twelve Resources and one example Application. Terms are defined in [GLOSSARY.md](../GLOSSARY.md).

## The twelve Resources

The dataset is small on purpose: enough variety across Providers, Environments and Criticality to make search, filtering and grouping meaningful, and few enough rows to read at a glance. Row 1 is the sample Resource the data model was first written against, unchanged.

| id    | name                                | type                 | provider | region       | environment | criticality | owner    | tags             | openIssues |
| ----- | ----------------------------------- | -------------------- | -------- | ------------ | ----------- | ----------- | -------- | ---------------- | ---------- |
| r-001 | payments-api-prod                   | EC2 Instance         | AWS      | us-east-1    | production  | critical    | payments | pci, api         | 4          |
| r-002 | payments-api-staging                | EC2 Instance         | AWS      | us-east-1    | staging     | medium      | payments | api              | 1          |
| r-003 | payments-api-dev                    | EC2 Instance         | AWS      | us-east-1    | development | low         | payments | api              | 0          |
| r-004 | payments-ledger-db                  | RDS Database         | AWS      | us-east-1    | production  | critical    | payments | pci, database    | 2          |
| r-005 | ci-deploy-role                      | IAM Role             | AWS      | global       | production  | high        | platform | iam, ci          | 7          |
| r-006 | analytics-warehouse                 | BigQuery Dataset     | GCP      | us-central1  | production  | high        | data     | pii, analytics   | 3          |
| r-007 | analytics-raw-events-archive-bucket | Cloud Storage Bucket | GCP      | us-central1  | production  | medium      | data     | storage, archive | 0          |
| r-008 | analytics-etl-runner                | Cloud Run Service    | GCP      | europe-west1 | staging     | low         | data     | etl              | 5          |
| r-009 | analytics-notebooks-dev             | Compute Engine VM    | GCP      | europe-west1 | development | low         | data     | sandbox          | 0          |
| r-010 | identity-sso-gateway                | App Service          | Azure    | westeurope   | production  | critical    | identity | sso, public      | 0          |
| r-011 | identity-users-db                   | Azure SQL Database   | Azure    | westeurope   | production  | high        | identity | pii, database    | 2          |
| r-012 | identity-sync-job                   | Function App         | Azure    | northeurope  | staging     | medium      | identity | sync             | 1          |

`region`, `owner` and `tags` are stored on every row but not displayed in this version.

`openIssues` was in that sample row and in the required table columns, but missing from the first `Resource` interface. It is part of every Resource here ([ADR 0008](./adr/0008-open-issues-is-part-of-resource.md)).

## Why these twelve

Each capability has rows that exercise it.

- **Search.** "payments" matches 4 rows, "analytics" 4 and "identity" 3. "payments-api" matches the same service in all three Environments. "db" matches 2 rows across two Providers, and not at the start of the name. "role" matches 1.
- **Single filters.** Every value matches at least 2 rows.
  - Providers: AWS 5, GCP 4, Azure 3.
  - Environments: production 7, staging 3, development 2.
  - Criticality: 3 rows at each level.
- **Combined filters.** AWS + production matches 3 rows; production + critical matches 3. Azure + development and critical + staging match none, which shows the empty state. The second is realistic: nothing outside production is critical.
- **Sorting.** Criticality and open issue count disagree on purpose. `ci-deploy-role` is high with 7 open issues, `identity-sso-gateway` is critical with 0, and `analytics-etl-runner` is low with 5. Sorting by Criticality and sorting by open issues give visibly different orders.
- **Grouping.** Three natural Applications across three Providers: payments, data platform and identity. `ci-deploy-role` belongs in all three, which demonstrates that a Resource can be a Member of several Applications.
- **Graph.** Groups of 3 to 5 Members for the typical case. Ticking every row gives 12 nodes, the most the ring layout must handle.
- **Layout stress.** `analytics-raw-events-archive-bucket` is 35 characters long and exercises truncation in the table, the chips and the graph nodes.
- **Types.** Compute, databases, a bucket and an IAM role: the four kinds of Resource the product monitors.

## The example Application

Cloud Inventory opens with one Application already in place, so a first-time user can see a card, the drawer and the graph before creating anything.

| Field       | Value                                        |
| ----------- | -------------------------------------------- |
| Name        | Data Platform                                |
| Description | Analytics warehouse, pipelines and notebooks |
| Members     | r-006, r-007, r-008, r-009, r-005            |

Why this one:

- "Payments API" is the example Application name used throughout the docs. Application names must be unique, so the example does not take that name; a first-time user who types it is not met with a validation error.
- It includes `ci-deploy-role`. When a user creates a payments Application with the same role, that Resource is a Member of both.
- Its five Members cover three Criticality levels and both zero and non-zero open issue counts, so the graph and the Member table have something to show.

The example is an ordinary Application: it can be deleted, and once deleted it does not come back. The rules for when it appears are in [product.md](./product.md#first-run-and-saved-data).
