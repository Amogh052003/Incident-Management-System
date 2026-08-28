---
title: publisher
generated: true
source: src/core/distributed/publisher.js
generator: docs-as-code-demo
---

# publisher

<a name="publish"></a>

## publish(channel, payload) ⇒ <code>Promise.&lt;number&gt;</code>
Publishes a JSON-serialized payload to a Redis channel.

**Kind**: global function  
**Returns**: <code>Promise.&lt;number&gt;</code> - Redis publish result.  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>string</code> | Redis channel. |
| payload | <code>\*</code> | Value to serialize and publish. |
