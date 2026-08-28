---
title: signalService
generated: true
source: src/services/signalService.js
generator: docs-as-code-demo
---

# signalService

<a name="processSignal"></a>

## processSignal(signal) ⇒ <code>Promise.&lt;void&gt;</code>
Debounces a signal by component, reuses or creates an open work item, stores the signal,updates Redis metrics and caches, and emits local and distributed events.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after processing and event publication complete.  
**Throws**:

- <code>Error</code> When no work item can be found or a processing operation fails.


| Param | Type | Description |
| --- | --- | --- |
| signal | <code>Object</code> | Signal containing `component_id` and `message` fields. |
