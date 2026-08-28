---
title: resolvedState
generated: true
source: src/states/resolvedState.js
generator: docs-as-code-demo
---

# resolvedState

<a name="ResolvedState"></a>

## ResolvedState
State for a resolved work item awaiting closure.

**Kind**: global class  
<a name="ResolvedState+transition"></a>

### resolvedState.transition(newStatus, data) ⇒ <code>Promise.&lt;Object&gt;</code>
Closes a resolved work item.

**Kind**: instance method of [<code>ResolvedState</code>](#ResolvedState)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The closed status and end time update.  
**Throws**:

- <code>Error</code> When the requested transition is not `CLOSED`.


| Param | Type | Description |
| --- | --- | --- |
| newStatus | <code>string</code> | Requested next status. |
| data | <code>\*</code> | Additional transition data, which is not used here. |
