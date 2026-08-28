---
title: impactPropagation
generated: true
source: src/core/topology/impactPropagation.js
generator: docs-as-code-demo
---

# impactPropagation

<a name="propagateImpact"></a>

## propagateImpact(failedService) ⇒ <code>Array.&lt;string&gt;</code>
Marks resources that depend transitively on a failed service as degraded.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - IDs of resources reached through dependency edges.  

| Param | Type | Description |
| --- | --- | --- |
| failedService | <code>string</code> | Resource from which impact propagation starts. |
