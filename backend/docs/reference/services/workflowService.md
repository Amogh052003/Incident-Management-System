---
title: workflowService
generated: true
source: src/services/workflowService.js
generator: docs-as-code-demo
---

# workflowService

<a name="updateStatus"></a>

## updateStatus(id, newStatus, [data]) ⇒ <code>Promise.&lt;string&gt;</code>
Applies a state transition to a PostgreSQL work item in a transaction.The transition update and work-item log are committed together, followed bydashboard cache invalidation after the transaction succeeds.

**Kind**: global function  
**Returns**: <code>Promise.&lt;string&gt;</code> - A status update message after commit.  
**Throws**:

- <code>Error</code> When the work item is missing or the transition fails.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>number</code> |  | Work item ID. |
| newStatus | <code>string</code> |  | Requested status. |
| [data] | <code>Object</code> | <code>{}</code> | Additional transition data, including optional RCA data. |
