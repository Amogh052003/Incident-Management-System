---
title: basePlugins
generated: true
source: src/core/plugins/basePlugins.js
generator: docs-as-code-demo
---

# basePlugins

<a name="BasePlugin"></a>

## BasePlugin
Base implementation for application plugins.

**Kind**: global class  

* [BasePlugin](#BasePlugin)
    * [new BasePlugin([config])](#new_BasePlugin_new)
    * [.init(ctx)](#BasePlugin+init) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.destroy()](#BasePlugin+destroy) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_BasePlugin_new"></a>

### new BasePlugin([config])
Creates a base plugin with its configuration and default name.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [config] | <code>Object</code> | <code>{}</code> | Plugin configuration. |

<a name="BasePlugin+init"></a>

### basePlugin.init(ctx) ⇒ <code>Promise.&lt;void&gt;</code>
Initializes the plugin. The base implementation does nothing.

**Kind**: instance method of [<code>BasePlugin</code>](#BasePlugin)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves immediately.  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>\*</code> | Plugin initialization context. |

<a name="BasePlugin+destroy"></a>

### basePlugin.destroy() ⇒ <code>Promise.&lt;void&gt;</code>
Destroys the plugin. The base implementation does nothing.

**Kind**: instance method of [<code>BasePlugin</code>](#BasePlugin)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves immediately.
