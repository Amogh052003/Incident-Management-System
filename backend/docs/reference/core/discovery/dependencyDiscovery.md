---
title: dependencyDiscovery
generated: true
source: src/core/discovery/dependencyDiscovery.js
generator: docs-as-code-demo
---

# dependencyDiscovery

## Functions

<dl>
<dt><a href="#extractHost">extractHost(value)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Extracts a host-like value from a connection string or environment value.</p>
</dd>
<dt><a href="#discoverDependencies">discoverDependencies([k8sPods])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Infers Docker and Kubernetes dependency edges from container environment variables.</p>
</dd>
</dl>

<a name="extractHost"></a>

## extractHost(value) ⇒ <code>string</code> \| <code>null</code>
Extracts a host-like value from a connection string or environment value.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Extracted host or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | Value that may contain a supported URI or hostname. |

<a name="discoverDependencies"></a>

## discoverDependencies([k8sPods]) ⇒ <code>Promise.&lt;void&gt;</code>
Infers Docker and Kubernetes dependency edges from container environment variables.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after dependency edges are added.  

| Param | Type | Description |
| --- | --- | --- |
| [k8sPods] | <code>Array.&lt;Object&gt;</code> | Discovered Kubernetes pod summaries. |
