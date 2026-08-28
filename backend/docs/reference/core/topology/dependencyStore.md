---
title: dependencyStore
generated: true
source: src/core/topology/dependencyStore.js
generator: docs-as-code-demo
---

# dependencyStore

## Functions

<dl>
<dt><a href="#addDependency">addDependency(from, to)</a> ⇒ <code>void</code></dt>
<dd><p>Adds a unique directed dependency from one resource to another.</p>
</dd>
<dt><a href="#getDependencies">getDependencies()</a> ⇒ <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Returns the in-memory dependency map.</p>
</dd>
</dl>

<a name="addDependency"></a>

## addDependency(from, to) ⇒ <code>void</code>
Adds a unique directed dependency from one resource to another.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | Resource that depends on the target. |
| to | <code>string</code> | Resource depended upon. |

<a name="getDependencies"></a>

## getDependencies() ⇒ <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code>
Returns the in-memory dependency map.

**Kind**: global function  
**Returns**: <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> - Dependency targets keyed by source resource.
