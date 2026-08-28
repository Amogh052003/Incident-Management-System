---
title: resourceRegistry
generated: true
source: src/core/resources/resourceRegistry.js
generator: docs-as-code-demo
---

# resourceRegistry

## Functions

<dl>
<dt><a href="#registerResource">registerResource(resource)</a> ⇒ <code>void</code></dt>
<dd><p>Adds or replaces a resource in the shared registry and initializes its health.</p>
</dd>
<dt><a href="#updateResourceHealth">updateResourceHealth(id, status)</a> ⇒ <code>void</code></dt>
<dd><p>Updates a registered resource&#39;s health status and update timestamp.</p>
</dd>
<dt><a href="#getResources">getResources()</a> ⇒ <code>Object</code></dt>
<dd><p>Returns the shared resource registry object.</p>
</dd>
<dt><a href="#linkRuntimeInstance">linkRuntimeInstance(resourceId, instanceId)</a> ⇒ <code>void</code></dt>
<dd><p>Associates a runtime instance with a registered resource if not already linked.</p>
</dd>
</dl>

<a name="registerResource"></a>

## registerResource(resource) ⇒ <code>void</code>
Adds or replaces a resource in the shared registry and initializes its health.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| resource | <code>Object</code> | Resource object containing an `id` property. |

<a name="updateResourceHealth"></a>

## updateResourceHealth(id, status) ⇒ <code>void</code>
Updates a registered resource's health status and update timestamp.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Resource identifier. |
| status | <code>string</code> | New health status. |

<a name="getResources"></a>

## getResources() ⇒ <code>Object</code>
Returns the shared resource registry object.

**Kind**: global function  
**Returns**: <code>Object</code> - Resources keyed by resource identifier.  
<a name="linkRuntimeInstance"></a>

## linkRuntimeInstance(resourceId, instanceId) ⇒ <code>void</code>
Associates a runtime instance with a registered resource if not already linked.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | Resource identifier. |
| instanceId | <code>string</code> | Runtime instance identifier. |
