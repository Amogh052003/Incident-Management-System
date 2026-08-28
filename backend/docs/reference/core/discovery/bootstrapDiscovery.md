---
title: bootstrapDiscovery
generated: true
source: src/core/discovery/bootstrapDiscovery.js
generator: docs-as-code-demo
---

# bootstrapDiscovery

## Functions

<dl>
<dt><a href="#matchContainerToResource">matchContainerToResource(containerName, resources)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Finds a registered resource whose runtime selector occurs in a container name.</p>
</dd>
<dt><a href="#bootstrapDiscovery">bootstrapDiscovery()</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Discovers Docker containers, registers or links them, and attempts Kubernetes discovery.</p>
</dd>
</dl>

<a name="matchContainerToResource"></a>

## matchContainerToResource(containerName, resources) ⇒ <code>string</code> \| <code>null</code>
Finds a registered resource whose runtime selector occurs in a container name.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Matching resource ID, or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| containerName | <code>string</code> | Docker container name. |
| resources | <code>Object</code> | Resources keyed by ID. |

<a name="bootstrapDiscovery"></a>

## bootstrapDiscovery() ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Discovers Docker containers, registers or links them, and attempts Kubernetes discovery.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Kubernetes discovery data, or `null` when it is skipped.
