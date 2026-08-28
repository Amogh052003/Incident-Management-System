---
title: SlackPlugin
generated: true
source: src/core/plugins/slack/SlackPlugin.js
generator: docs-as-code-demo
---

# SlackPlugin

<a name="SlackPlugin"></a>

## SlackPlugin
Plugin that sends incident-created notifications to Slack.

**Kind**: global class  

* [SlackPlugin](#SlackPlugin)
    * [new SlackPlugin(config)](#new_SlackPlugin_new)
    * [.init(ctx)](#SlackPlugin+init) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.sendIncidentAlert(incident)](#SlackPlugin+sendIncidentAlert) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_SlackPlugin_new"></a>

### new SlackPlugin(config)
Creates a Slack plugin with the supplied webhook configuration.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Plugin configuration containing an optional `webhookUrl`. |

<a name="SlackPlugin+init"></a>

### slackPlugin.init(ctx) ⇒ <code>Promise.&lt;void&gt;</code>
Subscribes the plugin to incident-created events.

**Kind**: instance method of [<code>SlackPlugin</code>](#SlackPlugin)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the subscription is registered.  

| Param | Type | Description |
| --- | --- | --- |
| ctx | <code>Object</code> | Initialization context containing an event bus. |

<a name="SlackPlugin+sendIncidentAlert"></a>

### slackPlugin.sendIncidentAlert(incident) ⇒ <code>Promise.&lt;void&gt;</code>
Posts an incident-created message to the configured Slack webhook.

**Kind**: instance method of [<code>SlackPlugin</code>](#SlackPlugin)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after posting or logging a failed post.  

| Param | Type | Description |
| --- | --- | --- |
| incident | <code>Object</code> | Incident payload used to build the message. |
