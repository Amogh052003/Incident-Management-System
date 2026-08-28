---
title: alertStrategy
generated: true
source: src/strategies/alertStrategy.js
generator: docs-as-code-demo
---

# alertStrategy

<a name="AlertStrategy"></a>

## AlertStrategy
Base strategy for severity-specific alert handling.

**Kind**: global class  

* [AlertStrategy](#AlertStrategy)
    * [.sendAlert(context)](#AlertStrategy+sendAlert) ⇒ <code>void</code>
    * [.getSeverity()](#AlertStrategy+getSeverity) ⇒ <code>string</code>

<a name="AlertStrategy+sendAlert"></a>

### alertStrategy.sendAlert(context) ⇒ <code>void</code>
Defines the alert operation for a concrete strategy.

**Kind**: instance method of [<code>AlertStrategy</code>](#AlertStrategy)  
**Throws**:

- <code>Error</code> Always, because the base strategy has no implementation.


| Param | Type | Description |
| --- | --- | --- |
| context | <code>Object</code> | Alert context passed by the caller. |

<a name="AlertStrategy+getSeverity"></a>

### alertStrategy.getSeverity() ⇒ <code>string</code>
Returns this strategy's severity.

**Kind**: instance method of [<code>AlertStrategy</code>](#AlertStrategy)  
**Returns**: <code>string</code> - The configured severity.
