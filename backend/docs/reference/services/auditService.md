---
title: auditService
generated: true
source: src/services/auditService.js
generator: docs-as-code-demo
---

# auditService

## Functions

<dl>
<dt><a href="#logEvent">logEvent(eventType, [details])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Inserts an audit event into the PostgreSQL audit log.</p>
</dd>
<dt><a href="#getAuditLogs">getAuditLogs([filters])</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Retrieves audit log rows using optional event, component, severity, and paging filters.</p>
</dd>
<dt><a href="#getAuditComponents">getAuditComponents()</a> ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Retrieves distinct non-null audit components.</p>
</dd>
<dt><a href="#getAuditSeverities">getAuditSeverities()</a> ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Retrieves distinct non-null audit severities.</p>
</dd>
</dl>

<a name="logEvent"></a>

## logEvent(eventType, [details]) ⇒ <code>Promise.&lt;void&gt;</code>
Inserts an audit event into the PostgreSQL audit log.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the insert completes.  

| Param | Type | Description |
| --- | --- | --- |
| eventType | <code>string</code> | Event type to store. |
| [details] | <code>Object</code> | Optional event details. |
| [details.component] | <code>\*</code> | Component associated with the event. |
| [details.severity] | <code>\*</code> | Event severity. |
| [details.message] | <code>\*</code> | Event message. |
| [details.metadata] | <code>Object</code> | Additional metadata serialized as JSON. |

<a name="getAuditLogs"></a>

## getAuditLogs([filters]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Retrieves audit log rows using optional event, component, severity, and paging filters.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Matching rows ordered newest first.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [filters] | <code>Object</code> |  | Query filters. |
| [filters.eventType] | <code>\*</code> |  | Event type filter. |
| [filters.component] | <code>\*</code> |  | Component filter. |
| [filters.severity] | <code>\*</code> |  | Severity filter. |
| [filters.limit] | <code>number</code> | <code>100</code> | Maximum number of rows. |
| [filters.offset] | <code>number</code> | <code>0</code> | Number of rows to skip. |

<a name="getAuditComponents"></a>

## getAuditComponents() ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Retrieves distinct non-null audit components.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Sorted component names.  
<a name="getAuditSeverities"></a>

## getAuditSeverities() ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Retrieves distinct non-null audit severities.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Sorted severity values.
