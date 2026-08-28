---
title: runtimeMonitor
generated: true
source: src/core/discovery/runtimeMonitor.js
generator: docs-as-code-demo
---

# runtimeMonitor

## Functions

<dl>
<dt><a href="#matchContainerToResource">matchContainerToResource(containerName, resources)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Finds the resource whose runtime selector matches a container name.</p>
</dd>
<dt><a href="#getContainerName">getContainerName(event)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Extracts a container or Kubernetes pod name from a Docker event.</p>
</dd>
<dt><a href="#handleContainerEvent">handleContainerEvent(event)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Applies resource updates for a Docker container lifecycle event.</p>
</dd>
<dt><a href="#initializeRuntimeMonitor">initializeRuntimeMonitor()</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Starts listening for relevant Docker container lifecycle events.</p>
<p>Connection failures are logged and do not propagate to the caller.</p>
</dd>
</dl>

<a name="matchContainerToResource"></a>

## matchContainerToResource(containerName, resources) ⇒ <code>string</code> \| <code>null</code>
Finds the resource whose runtime selector matches a container name.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Matching resource ID, or null when none matches.  

| Param | Type | Description |
| --- | --- | --- |
| containerName | <code>string</code> | Docker container name. |
| resources | <code>Object</code> | Resources keyed by resource ID. |

<a name="getContainerName"></a>

## getContainerName(event) ⇒ <code>string</code> \| <code>null</code>
Extracts a container or Kubernetes pod name from a Docker event.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Runtime name, or null when the event has no name.  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Docker event object. |

<a name="handleContainerEvent"></a>

## handleContainerEvent(event) ⇒ <code>Promise.&lt;void&gt;</code>
Applies resource updates for a Docker container lifecycle event.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the event is handled.  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | Docker container event. |

<a name="initializeRuntimeMonitor"></a>

## initializeRuntimeMonitor() ⇒ <code>Promise.&lt;void&gt;</code>
Starts listening for relevant Docker container lifecycle events.

Connection failures are logged and do not propagate to the caller.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the Docker event stream is configured.
