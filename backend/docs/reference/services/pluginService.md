---
title: pluginService
generated: true
source: src/services/pluginService.js
generator: docs-as-code-demo
---

# pluginService

## Functions

<dl>
<dt><a href="#getPlugins">getPlugins()</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Retrieves plugin rows, normalizing a missing subscribed-event list to an empty array.</p>
</dd>
<dt><a href="#getPluginById">getPluginById(id)</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Retrieves one plugin by ID, using a short-lived Redis cache.</p>
</dd>
<dt><a href="#updatePlugin">updatePlugin(id, updates)</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Updates permitted plugin columns and clears the plugin caches.</p>
</dd>
<dt><a href="#seedPlugins">seedPlugins()</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Inserts default plugin rows when the plugin table is empty.</p>
</dd>
<dt><a href="#getActivityFeed">getActivityFeed([limit])</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Retrieves recent plugin activity, using a short-lived Redis cache.</p>
</dd>
<dt><a href="#logPluginActivity">logPluginActivity(pluginName, action, [details])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Inserts a plugin activity row and clears the activity cache.</p>
</dd>
</dl>

<a name="getPlugins"></a>

## getPlugins() ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Retrieves plugin rows, normalizing a missing subscribed-event list to an empty array.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Plugins ordered by name.  
<a name="getPluginById"></a>

## getPluginById(id) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Retrieves one plugin by ID, using a short-lived Redis cache.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Matching plugin or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | Plugin ID. |

<a name="updatePlugin"></a>

## updatePlugin(id, updates) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Updates permitted plugin columns and clears the plugin caches.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Updated row, or `null` when no permitted updates exist or the row is absent.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | Plugin ID. |
| updates | <code>Object</code> | Candidate column values; unsupported keys are ignored. |

<a name="seedPlugins"></a>

## seedPlugins() ⇒ <code>Promise.&lt;void&gt;</code>
Inserts default plugin rows when the plugin table is empty.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after seeding or when existing rows are found.  
<a name="getActivityFeed"></a>

## getActivityFeed([limit]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Retrieves recent plugin activity, using a short-lived Redis cache.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Recent activity rows.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [limit] | <code>number</code> | <code>20</code> | Maximum number of activity rows. |

<a name="logPluginActivity"></a>

## logPluginActivity(pluginName, action, [details]) ⇒ <code>Promise.&lt;void&gt;</code>
Inserts a plugin activity row and clears the activity cache.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the insert and cache deletion.  

| Param | Type | Description |
| --- | --- | --- |
| pluginName | <code>string</code> | Plugin name. |
| action | <code>string</code> | Activity action. |
| [details] | <code>\*</code> | Optional activity details. |
