---
title: integrationService
generated: true
source: src/services/integrationService.js
generator: docs-as-code-demo
---

# integrationService

## Functions

<dl>
<dt><a href="#getIntegrations">getIntegrations()</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Returns integrations from Redis when cached, otherwise reads and caches them from PostgreSQL.</p>
</dd>
<dt><a href="#getIntegrationByName">getIntegrationByName(name)</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Retrieves one integration by name from PostgreSQL.</p>
</dd>
<dt><a href="#upsertIntegration">upsertIntegration(name, config, [status])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Inserts or updates an integration and clears the integrations list cache.</p>
</dd>
<dt><a href="#seedIntegrations">seedIntegrations()</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Inserts the built-in integration rows when the table is empty.</p>
</dd>
</dl>

<a name="getIntegrations"></a>

## getIntegrations() ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Returns integrations from Redis when cached, otherwise reads and caches them from PostgreSQL.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Integrations ordered by name.  
<a name="getIntegrationByName"></a>

## getIntegrationByName(name) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Retrieves one integration by name from PostgreSQL.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Matching integration or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Integration name. |

<a name="upsertIntegration"></a>

## upsertIntegration(name, config, [status]) ⇒ <code>Promise.&lt;Object&gt;</code>
Inserts or updates an integration and clears the integrations list cache.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Inserted or updated row.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Integration name. |
| config | <code>Object</code> | Configuration stored as JSON. |
| [status] | <code>\*</code> | Status to store, or the existing status on update. |

<a name="seedIntegrations"></a>

## seedIntegrations() ⇒ <code>Promise.&lt;void&gt;</code>
Inserts the built-in integration rows when the table is empty.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after seeding or when existing rows are found.
