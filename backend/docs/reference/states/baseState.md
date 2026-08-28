---
title: baseState
generated: true
source: src/states/baseState.js
generator: docs-as-code-demo
---

# baseState

<a name="BaseState"></a>

## BaseState
Base state implementation for work-item status transitions.

**Kind**: global class  

* [BaseState](#BaseState)
    * [new BaseState(workItem)](#new_BaseState_new)
    * [.transition(newStatus, data)](#BaseState+transition) ⇒ <code>Promise.&lt;never&gt;</code>

<a name="new_BaseState_new"></a>

### new BaseState(workItem)
Creates a state wrapper for a work item.


| Param | Type | Description |
| --- | --- | --- |
| workItem | <code>Object</code> | Work item associated with the state. |

<a name="BaseState+transition"></a>

### baseState.transition(newStatus, data) ⇒ <code>Promise.&lt;never&gt;</code>
Defines the transition operation for a concrete state.

**Kind**: instance method of [<code>BaseState</code>](#BaseState)  
**Returns**: <code>Promise.&lt;never&gt;</code> - Never resolves in the base implementation.  
**Throws**:

- <code>Error</code> Always, because the transition is not implemented.


| Param | Type | Description |
| --- | --- | --- |
| newStatus | <code>string</code> | Requested next status. |
| data | <code>\*</code> | Additional transition data. |
