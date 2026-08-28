---
title: investigatingState
generated: true
source: src/states/investigatingState.js
generator: docs-as-code-demo
---

# investigatingState

<a name="InvestigatingState"></a>

## InvestigatingState
State for a work item being investigated and prepared for resolution.

**Kind**: global class  
<a name="InvestigatingState+transition"></a>

### investigatingState.transition(newStatus, data) ⇒ <code>Promise.&lt;Object&gt;</code>
Resolves an investigating work item when complete RCA fields are provided.

**Kind**: instance method of [<code>InvestigatingState</code>](#InvestigatingState)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The resolved status, start time, and RCA data.  
**Throws**:

- <code>Error</code> When RCA data is incomplete or the transition is unsupported.


| Param | Type | Description |
| --- | --- | --- |
| newStatus | <code>string</code> | Requested next status. |
| data | <code>Object</code> | Transition data containing RCA fields for resolution. |
