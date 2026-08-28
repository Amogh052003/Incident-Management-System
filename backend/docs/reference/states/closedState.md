---
title: closedState
generated: true
source: src/states/closedState.js
generator: docs-as-code-demo
---

# closedState

<a name="ClosedState"></a>

## ClosedState
State representing a work item that cannot transition further.

**Kind**: global class  
<a name="ClosedState+transition"></a>

### closedState.transition() ⇒ <code>Promise.&lt;never&gt;</code>
Rejects all transitions from a closed work item.

**Kind**: instance method of [<code>ClosedState</code>](#ClosedState)  
**Returns**: <code>Promise.&lt;never&gt;</code> - Never resolves because closed items cannot transition.  
**Throws**:

- <code>Error</code> Always, because the incident is already closed.
