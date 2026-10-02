# Cloud Inventory

The inventory of an organisation's cloud resources, as monitored by a cloud security company, and the grouping of those resources into Applications.

## Language

### Inventory

**Resource**:
A single cloud asset the organisation runs, such as a bucket, a database, a compute instance or an IAM role.
_Avoid_: Asset, item

**Type**:
The provider's own name for what a Resource is, such as "EC2 Instance" or "IAM Role".
_Avoid_: Kind, category

**Provider**:
The cloud vendor a Resource runs on: AWS, GCP or Azure.
_Avoid_: Cloud, vendor

**Environment**:
The deployment stage a Resource serves: production, staging or development.
_Avoid_: Stage, tier

**Criticality**:
How important a Resource is to the organisation, on four ordered levels from low to critical. Resources are ranked "most critical first".
_Avoid_: Severity, priority, risk

**Open issue**:
An unresolved security finding on a Resource. Only the count per Resource is known; an Application has no count of its own.
_Avoid_: Alert, vulnerability

### Grouping

**Application**:
A named, logical group of Resources, such as "Payments API".
_Avoid_: App, group, project

**Example Application**:
The one Application that already exists the first time Cloud Inventory is opened. It is an ordinary Application and can be deleted like any other.
_Avoid_: Seed, default application, sample

**Member**:
A Resource that belongs to an Application, whether the Application is saved or still being drafted. A Resource can be a Member of any number of Applications, or of none.
_Avoid_: Chosen resource, child

**Selection**:
The transient set of Resources ticked in the Resources table. It is not an Application and has no name.
_Avoid_: Chosen, picked, checked

### The product

**Cloud Inventory**:
The software itself.
_Avoid_: App, the application
