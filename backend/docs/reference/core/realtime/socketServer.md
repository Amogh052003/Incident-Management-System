---
title: socketServer
generated: true
source: src/core/realtime/socketServer.js
generator: docs-as-code-demo
---

# socketServer

## Functions

<dl>
<dt><a href="#initializeSocket">initializeSocket(server)</a> ⇒ <code>void</code></dt>
<dd><p>Creates the Socket.IO server and logs client connections and disconnections.</p>
</dd>
<dt><a href="#getIO">getIO()</a> ⇒ <code>Object</code> | <code>null</code></dt>
<dd><p>Returns the initialized Socket.IO server instance.</p>
</dd>
</dl>

<a name="initializeSocket"></a>

## initializeSocket(server) ⇒ <code>void</code>
Creates the Socket.IO server and logs client connections and disconnections.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>Object</code> | HTTP server passed to Socket.IO. |

<a name="getIO"></a>

## getIO() ⇒ <code>Object</code> \| <code>null</code>
Returns the initialized Socket.IO server instance.

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>null</code> - Socket.IO instance or `null` before initialization.
