---
title: retry
generated: true
source: src/utils/retry.js
generator: docs-as-code-demo
---

# retry

<a name="retry"></a>

## retry(fn, [retries], [delay]) ⇒ <code>Promise.&lt;\*&gt;</code>
Runs an asynchronous operation again after failures using exponential backoff.

**Kind**: global function  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The value returned by the successful operation.  
**Throws**:

- <code>\*</code> The error from the final failed attempt.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>function</code> |  | Operation to invoke. |
| [retries] | <code>number</code> | <code>3</code> | Maximum number of attempts. |
| [delay] | <code>number</code> | <code>100</code> | Initial delay in milliseconds. |
