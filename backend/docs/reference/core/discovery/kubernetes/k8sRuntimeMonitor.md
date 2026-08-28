---
title: k8sRuntimeMonitor
generated: true
source: src/core/discovery/kubernetes/k8sRuntimeMonitor.js
generator: docs-as-code-demo
---

# k8sRuntimeMonitor

## Functions

<dl>
<dt><a href="#matchPodToResource">matchPodToResource(podName, resources)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Finds the resource whose runtime selector matches a Kubernetes pod name.</p>
</dd>
<dt><a href="#initializeK8sRuntimeMonitor">initializeK8sRuntimeMonitor()</a> ⇒ <code>Promise.&lt;*&gt;</code></dt>
<dd><p>Starts watching Kubernetes pod events and updates discovered resources.</p>
</dd>
</dl>

<a name="matchPodToResource"></a>

## matchPodToResource(podName, resources) ⇒ <code>string</code> \| <code>null</code>
Finds the resource whose runtime selector matches a Kubernetes pod name.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Matching resource ID, or null when none matches.  

| Param | Type | Description |
| --- | --- | --- |
| podName | <code>string</code> | Kubernetes pod name. |
| resources | <code>Object</code> | Resources keyed by resource ID. |

<a name="initializeK8sRuntimeMonitor"></a>

## initializeK8sRuntimeMonitor() ⇒ <code>Promise.&lt;\*&gt;</code>
Starts watching Kubernetes pod events and updates discovered resources.

**Kind**: global function  
**Returns**: <code>Promise.&lt;\*&gt;</code> - Kubernetes watch request, or null when monitoring is unavailable.
