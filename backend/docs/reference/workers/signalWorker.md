---
title: signalWorker
generated: true
source: src/workers/signalWorker.js
generator: docs-as-code-demo
---

# signalWorker

<a name="startWorker"></a>

## startWorker() ⇒ <code>Promise.&lt;never&gt;</code>
Connects to MongoDB, consumes JSON signals from Redis, stores raw payloads,and passes valid signals to the signal processor.The worker continues consuming after malformed messages or processing errors.

**Kind**: global function  
**Returns**: <code>Promise.&lt;never&gt;</code> - Runs continuously while the worker is active.
