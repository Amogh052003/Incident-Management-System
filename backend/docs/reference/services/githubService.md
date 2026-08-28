---
title: githubService
generated: true
source: src/services/githubService.js
generator: docs-as-code-demo
---

# githubService

## Functions

<dl>
<dt><a href="#generateJWT">generateJWT()</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Creates a short-lived RS256 JWT for GitHub App API requests.</p>
</dd>
<dt><a href="#getInstallationToken">getInstallationToken(installationId)</a> ⇒ <code>Promise.&lt;string&gt;</code></dt>
<dd><p>Requests an access token for a GitHub App installation.</p>
</dd>
<dt><a href="#fetchInstallationsFromGitHub">fetchInstallationsFromGitHub()</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Fetches GitHub App installations, stores the first one in MongoDB, and returns it.</p>
</dd>
<dt><a href="#getInstallation">getInstallation()</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Retrieves the newest stored GitHub installation, falling back to the GitHub API.</p>
</dd>
<dt><a href="#storeInstallation">storeInstallation(payload)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Upserts a GitHub installation from an installation webhook payload.</p>
</dd>
<dt><a href="#removeInstallation">removeInstallation(installationId)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Deletes a stored GitHub installation by installation ID.</p>
</dd>
<dt><a href="#listServicesWithRepo">listServicesWithRepo()</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Loads all repository mappings and indexes them by service name.</p>
</dd>
<dt><a href="#getServiceMapping">getServiceMapping(service)</a> ⇒ <code>Promise.&lt;(Object|null)&gt;</code></dt>
<dd><p>Retrieves a repository mapping for one service.</p>
</dd>
<dt><a href="#setManualMapping">setManualMapping(service, repoFullName, [namespace])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Upserts a manual service-to-repository mapping unless an annotation mapping exists.</p>
</dd>
<dt><a href="#validateRepoAccess">validateRepoAccess(installationId, repoFullName)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Checks whether a GitHub installation token can access a repository.</p>
</dd>
<dt><a href="#createIssue">createIssue(installationId, repoFullName, title, body, [labels])</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Creates a GitHub issue in a repository using an installation token.</p>
</dd>
<dt><a href="#linkIssueToIncident">linkIssueToIncident(incidentId, issueNumber, repoFullName, service)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Stores a MongoDB link between an incident and a GitHub issue.</p>
</dd>
<dt><a href="#getIncidentIssueLinks">getIncidentIssueLinks(incidentId)</a> ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code></dt>
<dd><p>Retrieves GitHub issue links for an incident.</p>
</dd>
<dt><a href="#getInstallUrl">getInstallUrl()</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Returns the configured GitHub App installation URL.</p>
</dd>
<dt><a href="#processWebhook">processWebhook(event, payload)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Handles supported GitHub installation webhook events.</p>
</dd>
</dl>

<a name="generateJWT"></a>

## generateJWT() ⇒ <code>string</code> \| <code>null</code>
Creates a short-lived RS256 JWT for GitHub App API requests.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Signed JWT, or `null` when app credentials are unavailable.  
<a name="getInstallationToken"></a>

## getInstallationToken(installationId) ⇒ <code>Promise.&lt;string&gt;</code>
Requests an access token for a GitHub App installation.

**Kind**: global function  
**Returns**: <code>Promise.&lt;string&gt;</code> - Installation access token.  
**Throws**:

- <code>Error</code> When the app is not configured or GitHub rejects the request.


| Param | Type | Description |
| --- | --- | --- |
| installationId | <code>number</code> | GitHub installation ID. |

<a name="fetchInstallationsFromGitHub"></a>

## fetchInstallationsFromGitHub() ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Fetches GitHub App installations, stores the first one in MongoDB, and returns it.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Stored installation document, or `null` when unavailable.  
<a name="getInstallation"></a>

## getInstallation() ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Retrieves the newest stored GitHub installation, falling back to the GitHub API.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Installation document or `null`.  
<a name="storeInstallation"></a>

## storeInstallation(payload) ⇒ <code>Promise.&lt;Object&gt;</code>
Upserts a GitHub installation from an installation webhook payload.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Stored installation document.  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>Object</code> | Webhook payload containing installation/account data. |

<a name="removeInstallation"></a>

## removeInstallation(installationId) ⇒ <code>Promise.&lt;void&gt;</code>
Deletes a stored GitHub installation by installation ID.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after deletion.  

| Param | Type | Description |
| --- | --- | --- |
| installationId | <code>number</code> | GitHub installation ID. |

<a name="listServicesWithRepo"></a>

## listServicesWithRepo() ⇒ <code>Promise.&lt;Object&gt;</code>
Loads all repository mappings and indexes them by service name.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Repository mappings keyed by service.  
<a name="getServiceMapping"></a>

## getServiceMapping(service) ⇒ <code>Promise.&lt;(Object\|null)&gt;</code>
Retrieves a repository mapping for one service.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(Object\|null)&gt;</code> - Matching mapping document or `null`.  

| Param | Type | Description |
| --- | --- | --- |
| service | <code>string</code> | Service name. |

<a name="setManualMapping"></a>

## setManualMapping(service, repoFullName, [namespace]) ⇒ <code>Promise.&lt;Object&gt;</code>
Upserts a manual service-to-repository mapping unless an annotation mapping exists.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Stored mapping or an error object when protected by an annotation mapping.  

| Param | Type | Description |
| --- | --- | --- |
| service | <code>string</code> | Service name. |
| repoFullName | <code>string</code> | Repository name in owner/name form. |
| [namespace] | <code>string</code> | Kubernetes namespace to store. |

<a name="validateRepoAccess"></a>

## validateRepoAccess(installationId, repoFullName) ⇒ <code>Promise.&lt;Object&gt;</code>
Checks whether a GitHub installation token can access a repository.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - `{ valid: true }`, or an object describing an inaccessible repository.  

| Param | Type | Description |
| --- | --- | --- |
| installationId | <code>number</code> | GitHub installation ID. |
| repoFullName | <code>string</code> | Repository name in owner/name form. |

<a name="createIssue"></a>

## createIssue(installationId, repoFullName, title, body, [labels]) ⇒ <code>Promise.&lt;Object&gt;</code>
Creates a GitHub issue in a repository using an installation token.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - GitHub issue response data.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| installationId | <code>number</code> |  | GitHub installation ID. |
| repoFullName | <code>string</code> |  | Repository name in owner/name form. |
| title | <code>string</code> |  | Issue title. |
| body | <code>string</code> |  | Issue body. |
| [labels] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | Issue labels. |

<a name="linkIssueToIncident"></a>

## linkIssueToIncident(incidentId, issueNumber, repoFullName, service) ⇒ <code>Promise.&lt;Object&gt;</code>
Stores a MongoDB link between an incident and a GitHub issue.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Created issue-link document.  

| Param | Type | Description |
| --- | --- | --- |
| incidentId | <code>\*</code> | Incident identifier. |
| issueNumber | <code>number</code> | GitHub issue number. |
| repoFullName | <code>string</code> | Repository name in owner/name form. |
| service | <code>string</code> | Service associated with the issue. |

<a name="getIncidentIssueLinks"></a>

## getIncidentIssueLinks(incidentId) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Retrieves GitHub issue links for an incident.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Matching issue-link documents.  

| Param | Type | Description |
| --- | --- | --- |
| incidentId | <code>\*</code> | Incident identifier. |

<a name="getInstallUrl"></a>

## getInstallUrl() ⇒ <code>string</code> \| <code>null</code>
Returns the configured GitHub App installation URL.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Installation URL or `null`.  
<a name="processWebhook"></a>

## processWebhook(event, payload) ⇒ <code>Promise.&lt;void&gt;</code>
Handles supported GitHub installation webhook events.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the supported installation operation.  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | GitHub event name. |
| payload | <code>Object</code> | Event payload. |
