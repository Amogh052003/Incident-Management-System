---
title: k8sDependencyDiscovery
generated: true
source: src/core/discovery/kubernetes/k8sDependencyDiscovery.js
generator: docs-as-code-demo
---

# k8sDependencyDiscovery

## Functions

<dl>
<dt><a href="#extractHost">extractHost(value)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Extracts a host-like value from a supported connection string.</p>
</dd>
<dt><a href="#discoverK8sDependencies">discoverK8sDependencies(discoveredPods)</a> ⇒ <code>Promise.&lt;number&gt;</code></dt>
<dd><p>Infers dependency edges from environment variables in discovered Kubernetes pods.</p>
</dd>
</dl>

<a name="extractHost"></a>

## extractHost(value) ⇒ <code>string</code> \| <code>null</code>
Extracts a host-like value from a supported connection string.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Extracted host or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | Value that may contain a URI or hostname. |

<a name="discoverK8sDependencies"></a>

## discoverK8sDependencies(discoveredPods) ⇒ <code>Promise.&lt;number&gt;</code>
Infers dependency edges from environment variables in discovered Kubernetes pods.

**Kind**: global function  
**Returns**: <code>Promise.&lt;number&gt;</code> - Number of dependency edges inferred.  

| Param | Type | Description |
| --- | --- | --- |
| discoveredPods | <code>Array.&lt;Object&gt;</code> | Normalized pod summaries. |
