---
title: pluginManager
generated: true
source: src/core/plugins/pluginManager.js
generator: docs-as-code-demo
---

# pluginManager

<a name="PluginManager"></a>

## PluginManager
Maintains registered plugins and coordinates their initialization.

**Kind**: global class  

* [PluginManager](#PluginManager)
    * [new PluginManager()](#new_PluginManager_new)
    * [.register(plugin)](#PluginManager+register) ⇒ <code>void</code>
    * [.initAll(ctx)](#PluginManager+initAll) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.getPlugins()](#PluginManager+getPlugins) ⇒ <code>Array.&lt;Object&gt;</code>

<a name="new_PluginManager_new"></a>

### new PluginManager()
Creates an empty plugin manager.

<a name="PluginManager+register"></a>

### pluginManager.register(plugin) ⇒ <code>void</code>
Registers a plugin and logs its name.

**Kind**: instance method of [<code>PluginManager</code>](#PluginManager)  

| Param | Type | Description |
| --- | --- | --- |
| plugin | <code>Object</code> | Plugin containing a `name` property. |

<a name="PluginManager+initAll"></a>

### pluginManager.initAll(ctx) ⇒ <code>Promise.&lt;void&gt;</code>
Initializes every registered plugin with the supplied context.

**Kind**: instance method of [<code>PluginManager</code>](#PluginManager)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after all plugins initialize.  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>\*</code> | Context passed to each plugin's `init` method. |

<a name="PluginManager+getPlugins"></a>

### pluginManager.getPlugins() ⇒ <code>Array.&lt;Object&gt;</code>
Returns the registered plugin instances.

**Kind**: instance method of [<code>PluginManager</code>](#PluginManager)  
**Returns**: <code>Array.&lt;Object&gt;</code> - Registered plugins.
