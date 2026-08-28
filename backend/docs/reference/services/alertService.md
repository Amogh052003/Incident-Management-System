---
title: alertService
generated: true
source: src/services/alertService.js
generator: docs-as-code-demo
---

# alertService

## Functions

<dl>
<dt><a href="#getStrategy">getStrategy(component_id)</a> ⇒ <code>Object</code></dt>
<dd><p>Creates an alert strategy based on component name substrings.</p>
</dd>
<dt><a href="#triggerAlert">triggerAlert(signal)</a> ⇒ <code>string</code></dt>
<dd><p>Sends an alert through the strategy selected for a signal.</p>
</dd>
</dl>

<a name="getStrategy"></a>

## getStrategy(component_id) ⇒ <code>Object</code>
Creates an alert strategy based on component name substrings.

**Kind**: global function  
**Returns**: <code>Object</code> - P0, P1, or P2 alert strategy instance.  

| Param | Type | Description |
| --- | --- | --- |
| component_id | <code>string</code> | Component identifier to classify. |

<a name="triggerAlert"></a>

## triggerAlert(signal) ⇒ <code>string</code>
Sends an alert through the strategy selected for a signal.

**Kind**: global function  
**Returns**: <code>string</code> - Severity reported by the selected strategy.  

| Param | Type | Description |
| --- | --- | --- |
| signal | <code>Object</code> | Signal containing a `component_id` and alert context. |
