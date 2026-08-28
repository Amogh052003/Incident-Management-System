---
title: K8sDiscovery
generated: true
source: src/core/discovery/kubernetes/K8sDiscovery.js
generator: docs-as-code-demo
---

# K8sDiscovery

## Functions

<dl>
<dt><a href="#matchPodToResource">matchPodToResource(podName, resources)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Finds a registered resource whose runtime selector occurs in a pod name.</p>
</dd>
<dt><a href="#discoverCluster">discoverCluster()</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Lists Kubernetes pods, services, and deployments and registers discovered resources and edges.</p>
</dd>
</dl>

<a name="matchPodToResource"></a>

## matchPodToResource(podName, resources) ⇒ <code>string</code> \| <code>null</code>
Finds a registered resource whose runtime selector occurs in a pod name.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Matching resource ID, or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| podName | <code>string</code> | Kubernetes pod name. |
| resources | <code>Object</code> | Resources keyed by ID. |

<a name="discoverCluster"></a>

## discoverCluster() ⇒ <code>Promise.&lt;Object&gt;</code>
Lists Kubernetes pods, services, and deployments and registers discovered resources and edges.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Normalized discovery data plus raw pods.
