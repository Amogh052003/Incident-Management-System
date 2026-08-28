---
title: stateFactory
generated: true
source: src/states/stateFactory.js
generator: docs-as-code-demo
---

# stateFactory

<a name="getState"></a>

## getState(workItem) ⇒ <code>Object</code>
Creates the state object corresponding to a work item's status.

**Kind**: global function  
**Returns**: <code>Object</code> - A state instance for the work item.  
**Throws**:

- <code>Error</code> When the status is not supported.


| Param | Type | Description |
| --- | --- | --- |
| workItem | <code>Object</code> | Work item whose `status` selects the state class. |
