---
title: logService
generated: true
source: src/services/logService.js
generator: docs-as-code-demo
---

# logService

## Functions

<dl>
<dt><a href="#searchLogs">searchLogs([filters])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Searches audit, signal, and work-item logs, merges them by timestamp, and pages the result.</p>
</dd>
<dt><a href="#queryAuditLogs">queryAuditLogs([q], [from], [to], [severity], [component], limit)</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Queries PostgreSQL audit logs and maps rows to the shared log-entry shape.</p>
</dd>
<dt><a href="#querySignalLogs">querySignalLogs([q], [from], [to], [component], limit)</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Queries MongoDB signals and maps documents to the shared log-entry shape.</p>
</dd>
<dt><a href="#queryWorkItemLogs">queryWorkItemLogs([q], [from], [to], [component], limit)</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Queries PostgreSQL work-item status logs and maps rows to the shared log-entry shape.</p>
</dd>
<dt><a href="#getLogFilters">getLogFilters()</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Collects available log sources, severities, and component names across data stores.</p>
</dd>
</dl>

<a name="searchLogs"></a>

## searchLogs([filters]) ⇒ <code>Promise.&lt;Object&gt;</code>
Searches audit, signal, and work-item logs, merges them by timestamp, and pages the result.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Paged entries and total counts.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [filters] | <code>Object</code> |  | Search and paging filters. |
| [filters.q] | <code>string</code> |  | Text query. |
| [filters.from] | <code>\*</code> |  | Inclusive lower timestamp bound. |
| [filters.to] | <code>\*</code> |  | Inclusive upper timestamp bound. |
| [filters.sources] | <code>string</code> |  | Comma-separated source names or `all`. |
| [filters.severity] | <code>string</code> |  | Comma-separated severity values. |
| [filters.component] | <code>string</code> |  | Component filter. |
| [filters.page] | <code>number</code> | <code>1</code> | One-based result page. |
| [filters.limit] | <code>number</code> | <code>50</code> | Results per page. |

<a name="queryAuditLogs"></a>

## queryAuditLogs([q], [from], [to], [severity], [component], limit) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Queries PostgreSQL audit logs and maps rows to the shared log-entry shape.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Matching audit entries.  

| Param | Type | Description |
| --- | --- | --- |
| [q] | <code>string</code> | Text query. |
| [from] | <code>\*</code> | Inclusive lower timestamp bound. |
| [to] | <code>\*</code> | Inclusive upper timestamp bound. |
| [severity] | <code>string</code> | Comma-separated severity values. |
| [component] | <code>string</code> | Component filter. |
| limit | <code>number</code> | Maximum number of rows to query. |

<a name="querySignalLogs"></a>

## querySignalLogs([q], [from], [to], [component], limit) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Queries MongoDB signals and maps documents to the shared log-entry shape.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Matching signal entries.  

| Param | Type | Description |
| --- | --- | --- |
| [q] | <code>string</code> | Text query. |
| [from] | <code>\*</code> | Inclusive lower timestamp bound. |
| [to] | <code>\*</code> | Inclusive upper timestamp bound. |
| [component] | <code>string</code> | Component filter. |
| limit | <code>number</code> | Maximum number of documents to query. |

<a name="queryWorkItemLogs"></a>

## queryWorkItemLogs([q], [from], [to], [component], limit) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Queries PostgreSQL work-item status logs and maps rows to the shared log-entry shape.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Matching status-change entries.  

| Param | Type | Description |
| --- | --- | --- |
| [q] | <code>string</code> | Text query. |
| [from] | <code>\*</code> | Inclusive lower timestamp bound. |
| [to] | <code>\*</code> | Inclusive upper timestamp bound. |
| [component] | <code>string</code> | Component filter. |
| limit | <code>number</code> | Maximum number of rows to query. |

<a name="getLogFilters"></a>

## getLogFilters() ⇒ <code>Promise.&lt;Object&gt;</code>
Collects available log sources, severities, and component names across data stores.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Filter options for log searches.
