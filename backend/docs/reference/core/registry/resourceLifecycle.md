---
title: resourceLifecycle
generated: true
source: src/core/registry/resourceLifecycle.js
generator: docs-as-code-demo
---

# resourceLifecycle

## Functions

<dl>
<dt><a href="#canTransition">canTransition(from, to)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks whether a resource health status transition is allowed.</p>
</dd>
<dt><a href="#transitionResource">transitionResource(resource, newStatus)</a> ⇒ <code>boolean</code></dt>
<dd><p>Applies a valid health transition and updates resource timestamps.</p>
</dd>
</dl>

<a name="canTransition"></a>

## canTransition(from, to) ⇒ <code>boolean</code>
Checks whether a resource health status transition is allowed.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether the transition is listed as valid.  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | Current status. |
| to | <code>string</code> | Proposed status. |

<a name="transitionResource"></a>

## transitionResource(resource, newStatus) ⇒ <code>boolean</code>
Applies a valid health transition and updates resource timestamps.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether the transition was applied.  

| Param | Type | Description |
| --- | --- | --- |
| resource | <code>Object</code> | Resource with an optional `health` object. |
| newStatus | <code>string</code> | Target health status. |
