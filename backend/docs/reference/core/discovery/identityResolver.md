---
title: identityResolver
generated: true
source: src/core/discovery/identityResolver.js
generator: docs-as-code-demo
---

# identityResolver

<a name="resolveIdentity"></a>

## resolveIdentity(name) ⇒ <code>string</code> \| <code>null</code>
Resolves a runtime hostname to a registered resource using aliases and DNS prefixes.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Matching resource ID, or `null` when unresolved.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Runtime hostname or alias. |
