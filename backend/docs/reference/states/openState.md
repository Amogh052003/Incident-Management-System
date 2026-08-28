---
title: openState
generated: true
source: src/states/openState.js
generator: docs-as-code-demo
---

# openState

<a name="OpenState"></a>

## OpenState
State for a work item that can transition to investigation.

**Kind**: global class  
<a name="OpenState+transition"></a>

### openState.transition(newStatus, data) ⇒ <code>Promise.&lt;Object&gt;</code>
Moves an open work item to investigation.

**Kind**: instance method of [<code>OpenState</code>](#OpenState)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The status and start time update.  
**Throws**:

- <code>Error</code> When the requested transition is not supported.


| Param | Type | Description |
| --- | --- | --- |
| newStatus | <code>string</code> | Requested next status. |
| data | <code>\*</code> | Additional transition data, which is not used here. |
