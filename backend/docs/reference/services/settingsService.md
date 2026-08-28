---
title: settingsService
generated: true
source: src/services/settingsService.js
generator: docs-as-code-demo
---

# settingsService

## Functions

<dl>
<dt><a href="#getSettings">getSettings()</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Returns all settings from Redis when cached, otherwise reads and caches them from PostgreSQL.</p>
</dd>
<dt><a href="#getSetting">getSetting(key)</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Retrieves one setting by key from PostgreSQL.</p>
</dd>
<dt><a href="#setSetting">setSetting(key, value, [category])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Inserts or updates a setting and clears the cached settings list.</p>
</dd>
<dt><a href="#seedSettings">seedSettings()</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Inserts the default settings when the settings table is empty.</p>
</dd>
</dl>

<a name="getSettings"></a>

## getSettings() ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Returns all settings from Redis when cached, otherwise reads and caches them from PostgreSQL.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Settings ordered by category and key.  
<a name="getSetting"></a>

## getSetting(key) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Retrieves one setting by key from PostgreSQL.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Matching setting or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Setting key. |

<a name="setSetting"></a>

## setSetting(key, value, [category]) ⇒ <code>Promise.&lt;void&gt;</code>
Inserts or updates a setting and clears the cached settings list.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the database write and cache deletion.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | Setting key. |
| value | <code>\*</code> |  | Setting value stored in PostgreSQL. |
| [category] | <code>string</code> | <code>&quot;\&quot;general\&quot;&quot;</code> | Setting category. |

<a name="seedSettings"></a>

## seedSettings() ⇒ <code>Promise.&lt;void&gt;</code>
Inserts the default settings when the settings table is empty.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after seeding or when existing rows are found.
