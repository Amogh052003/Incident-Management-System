---
title: dashboardService
generated: true
source: src/services/dashboardService.js
generator: docs-as-code-demo
---

# dashboardService

## Functions

<dl>
<dt><a href="#invalidateDashboardListCaches">invalidateDashboardListCaches()</a> ⇒ <code>Promise.&lt;number&gt;</code></dt>
<dd><p>Deletes cached dashboard incident lists.</p>
</dd>
<dt><a href="#getActiveIncidents">getActiveIncidents([statusFilter])</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Retrieves incidents with optional status filtering and signal counts.</p>
<p>Results are read from or written to Redis; missing signal counts may be
supplemented from MongoDB when its connection is ready.</p>
</dd>
<dt><a href="#getIncidentById">getIncidentById(id)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Retrieves one incident and its signal count from PostgreSQL, Redis, or MongoDB.</p>
</dd>
<dt><a href="#getIncidentLogs">getIncidentLogs(id, [limit])</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Retrieves recent MongoDB signals for an incident and caches the result.</p>
</dd>
</dl>

<a name="invalidateDashboardListCaches"></a>

## invalidateDashboardListCaches() ⇒ <code>Promise.&lt;number&gt;</code>
Deletes cached dashboard incident lists.

**Kind**: global function  
**Returns**: <code>Promise.&lt;number&gt;</code> - Redis deletion result.  
<a name="getActiveIncidents"></a>

## getActiveIncidents([statusFilter]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Retrieves incidents with optional status filtering and signal counts.Results are read from or written to Redis; missing signal counts may besupplemented from MongoDB when its connection is ready.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Incident rows with `signal_count` values.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [statusFilter] | <code>string</code> | <code>&quot;\&quot;ACTIVE\&quot;&quot;</code> | `ACTIVE`, `ALL`, or a work-item status. |

<a name="getIncidentById"></a>

## getIncidentById(id) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieves one incident and its signal count from PostgreSQL, Redis, or MongoDB.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Incident row with `signal_count`.  
**Throws**:

- <code>Error</code> When no work item matches the ID.


| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | Work item ID used in database and cache keys. |

<a name="getIncidentLogs"></a>

## getIncidentLogs(id, [limit]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Retrieves recent MongoDB signals for an incident and caches the result.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Recent signal log entries, or an empty array when unavailable.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>\*</code> |  | Work item ID stored on signal documents. |
| [limit] | <code>number</code> | <code>50</code> | Maximum number of signals. |
