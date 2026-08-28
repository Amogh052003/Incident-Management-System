---
title: topologyServices
generated: true
source: src/core/topology/topologyServices.js
generator: docs-as-code-demo
---

# topologyServices

## Functions

<dl>
<dt><a href="#initializeTopology">initializeTopology()</a> ⇒ <code>void</code></dt>
<dd><p>Initializes topology state entries for all resources in the current graph.</p>
</dd>
<dt><a href="#markServiceDegraded">markServiceDegraded(service, incidentId)</a> ⇒ <code>void</code></dt>
<dd><p>Marks a known service as degraded and records an incident on it.</p>
</dd>
<dt><a href="#markServiceHealthy">markServiceHealthy(service)</a> ⇒ <code>void</code></dt>
<dd><p>Marks a known service as healthy and clears its incident list.</p>
</dd>
<dt><a href="#getTopologyState">getTopologyState()</a> ⇒ <code>Object</code></dt>
<dd><p>Builds topology state from the current resource health and incident data.</p>
</dd>
<dt><a href="#getTopologyGraph">getTopologyGraph()</a> ⇒ <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Returns the current resource dependency graph.</p>
</dd>
</dl>

<a name="initializeTopology"></a>

## initializeTopology() ⇒ <code>void</code>
Initializes topology state entries for all resources in the current graph.

**Kind**: global function  
<a name="markServiceDegraded"></a>

## markServiceDegraded(service, incidentId) ⇒ <code>void</code>
Marks a known service as degraded and records an incident on it.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| service | <code>string</code> | Service identifier. |
| incidentId | <code>\*</code> | Incident identifier to add to the service state. |

<a name="markServiceHealthy"></a>

## markServiceHealthy(service) ⇒ <code>void</code>
Marks a known service as healthy and clears its incident list.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| service | <code>string</code> | Service identifier. |

<a name="getTopologyState"></a>

## getTopologyState() ⇒ <code>Object</code>
Builds topology state from the current resource health and incident data.

**Kind**: global function  
**Returns**: <code>Object</code> - State keyed by resource identifier.  
<a name="getTopologyGraph"></a>

## getTopologyGraph() ⇒ <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code>
Returns the current resource dependency graph.

**Kind**: global function  
**Returns**: <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> - Resource dependency graph.
