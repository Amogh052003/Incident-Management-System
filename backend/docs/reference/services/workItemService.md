---
title: workItemService
generated: true
source: src/services/workItemService.js
generator: docs-as-code-demo
---

# workItemService

## Functions

<dl>
<dt><a href="#getSeverity">getSeverity(component_id)</a> ⇒ <code>string</code></dt>
<dd><p>Selects a severity from component name substrings.</p>
</dd>
<dt><a href="#createWorkItem">createWorkItem(component_id)</a> ⇒ <code>Promise.&lt;number&gt;</code></dt>
<dd><p>Inserts a work item with a derived severity and current timestamps.</p>
</dd>
</dl>

<a name="getSeverity"></a>

## getSeverity(component_id) ⇒ <code>string</code>
Selects a severity from component name substrings.

**Kind**: global function  
**Returns**: <code>string</code> - `P0`, `P1`, or `P2` based on the matching component category.  

| Param | Type | Description |
| --- | --- | --- |
| component_id | <code>string</code> | Component identifier to inspect. |

<a name="createWorkItem"></a>

## createWorkItem(component_id) ⇒ <code>Promise.&lt;number&gt;</code>
Inserts a work item with a derived severity and current timestamps.

**Kind**: global function  
**Returns**: <code>Promise.&lt;number&gt;</code> - The inserted work item ID.  

| Param | Type | Description |
| --- | --- | --- |
| component_id | <code>string</code> | Component associated with the work item. |
