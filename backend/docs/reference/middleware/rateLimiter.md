---
title: rateLimiter
generated: true
source: src/middleware/rateLimiter.js
generator: docs-as-code-demo
---

# rateLimiter

<a name="rateLimiter"></a>

## rateLimiter(req, res, next) ⇒ <code>Promise.&lt;void&gt;</code>
Limits requests by client IP using a Redis counterand a fixed expiration window.Requests over the configured limit receive HTTP 429.If Redis fails, the error is logged and the requestcontinues through the middleware chain.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after sending a response or calling next().  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request object. |
| res | <code>Object</code> | Express response object. |
| next | <code>function</code> | Express middleware continuation callback. |
