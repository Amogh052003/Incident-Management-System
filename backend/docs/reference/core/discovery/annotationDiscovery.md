---
title: annotationDiscovery
generated: true
source: src/core/discovery/annotationDiscovery.js
generator: docs-as-code-demo
---

# annotationDiscovery

## Constants

<dl>
<dt><a href="#ANNOTATION_KEY">ANNOTATION_KEY</a> : <code>string</code></dt>
<dd><p>Kubernetes annotation used to associate a deployment with a GitHub repository.</p>
<p>Expected annotation format:
<code>ims.io/github-repo: owner/repository</code></p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#extractRepoFromDeployment">extractRepoFromDeployment(deployment)</a> ⇒ <code>Object</code> | <code>null</code></dt>
<dd><p>Extracts GitHub repository information from a Kubernetes Deployment.</p>
<p>The function reads the repository mapping from the deployment&#39;s
<code>ims.io/github-repo</code> annotation and determines the service name from
the <code>ims/service</code> label. If the label is not present, the deployment
name is used as the service name.</p>
</dd>
<dt><a href="#discoverAnnotationsFromCluster">discoverAnnotationsFromCluster(k8sData)</a> ⇒ <code>Promise.&lt;Array.&lt;{service: string, repo: string, namespace: string}&gt;&gt;</code></dt>
<dd><p>Discovers GitHub repository mappings from Kubernetes Deployments.</p>
<p>Each deployment is inspected for the <code>ims.io/github-repo</code> annotation.
When a mapping is found, it is persisted to MongoDB using the
<a href="RepoMapping">RepoMapping</a> model.</p>
<p>Existing mappings are updated and new mappings are created using an
upsert operation.</p>
</dd>
</dl>

<a name="ANNOTATION_KEY"></a>

## ANNOTATION\_KEY : <code>string</code>
Kubernetes annotation used to associate a deployment with a GitHub repository.

Expected annotation format:
`ims.io/github-repo: owner/repository`

**Kind**: global constant  
<a name="extractRepoFromDeployment"></a>

## extractRepoFromDeployment(deployment) ⇒ <code>Object</code> \| <code>null</code>
Extracts GitHub repository information from a Kubernetes Deployment.

The function reads the repository mapping from the deployment's
`ims.io/github-repo` annotation and determines the service name from
the `ims/service` label. If the label is not present, the deployment
name is used as the service name.

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>null</code> - An object containing the service name, GitHub repository, and namespace.
Returns `null` when the GitHub repository annotation is not present.  

| Param | Type | Description |
| --- | --- | --- |
| deployment | <code>Object</code> | Kubernetes Deployment object. |
| [deployment.metadata] | <code>Object</code> | Deployment metadata. |
| [deployment.metadata.annotations] | <code>Object</code> | Kubernetes annotations. |
| [deployment.metadata.labels] | <code>Object</code> | Kubernetes labels. |
| [deployment.metadata.namespace] | <code>string</code> | Kubernetes namespace. |
| [deployment.metadata.name] | <code>string</code> | Deployment name. |

**Example**  
```js
const deployment = {
  metadata: {
    name: "incident-api",
    namespace: "production",
    annotations: {
      "ims.io/github-repo": "Amogh052003/Incident-Management-System"
    },
    labels: {
      "ims/service": "incident-api"
    }
  }
};

const result = extractRepoFromDeployment(deployment);

// {
//   service: "incident-api",
//   repo: "Amogh052003/Incident-Management-System",
//   namespace: "production"
// }
```
<a name="discoverAnnotationsFromCluster"></a>

## discoverAnnotationsFromCluster(k8sData) ⇒ <code>Promise.&lt;Array.&lt;{service: string, repo: string, namespace: string}&gt;&gt;</code>
Discovers GitHub repository mappings from Kubernetes Deployments.

Each deployment is inspected for the `ims.io/github-repo` annotation.
When a mapping is found, it is persisted to MongoDB using the
[RepoMapping](RepoMapping) model.

Existing mappings are updated and new mappings are created using an
upsert operation.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;{service: string, repo: string, namespace: string}&gt;&gt;</code> - List of repository mappings successfully discovered from annotations.  

| Param | Type | Description |
| --- | --- | --- |
| k8sData | <code>Object</code> | Kubernetes discovery result. |
| [k8sData.deployments] | <code>Array.&lt;Object&gt;</code> | Kubernetes Deployments to inspect. |

**Example**  
```js
const k8sData = {
  deployments: [
    {
      metadata: {
        name: "incident-api",
        namespace: "production",
        annotations: {
          "ims.io/github-repo": "Amogh052003/Incident-Management-System"
        },
        labels: {
          "ims/service": "incident-api"
        }
      }
    }
  ]
};

const mappings = await discoverAnnotationsFromCluster(k8sData);

// [
//   {
//     service: "incident-api",
//     repo: "Amogh052003/Incident-Management-System",
//     namespace: "production"
//   }
// ]
```
