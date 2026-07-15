pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  name: kaniko-builder
spec:
  containers:
  // Node container to handle dependency installs and testing
  - name: node
    image: node:18-alpine
    command:
    - cat
    tty: true
  // Kaniko container to build and push images
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    imagePullPolicy: Always
    command:
    - /busybox/cat
    tty: true
    workingDir: /tmp/jenkins
    volumeMounts:
    - name: registry-creds
      mountPath: /kaniko/.docker
  volumes:
  - name: registry-creds
    secret:
      secretName: kaniko-secret
"""
        }
    }

    environment {
        // Updated image paths to include the registry domain implicitly used by Kaniko
        BACKEND_IMAGE = "docker.io/IncidentManagementSystem/backend"
        FRONTEND_IMAGE = "docker.io/IncidentManagementSystem/frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        credentialsId: 'github',
                        url: 'https://github.com/Amogh052003/Incident-Management-System'
                    ]]
                )
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        container('node') {
                            dir('backend') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        container('node') {
                            dir('frontend') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        container('node') {
                            dir('backend') {
                                sh 'npm test'
                            }
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        container('node') {
                            dir('frontend') {
                                sh 'npm test'
                            }
                        }
                    }
                }
            }
        }

        // Kaniko builds and pushes the image simultaneously in a single command
        stage('Build & Push Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        container('kaniko') {
                            sh """
                            /kaniko/executor \
                            --context=${WORKSPACE}/backend \
                            --dockerfile=${WORKSPACE}/backend/Dockerfile \
                            --destination=${BACKEND_IMAGE}:${IMAGE_TAG} \
                            --destination=${BACKEND_IMAGE}:latest \
                            --cleanup
                            """
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        container('kaniko') {
                            sh """
                            /kaniko/executor \
                            --context=${WORKSPACE}/frontend \
                            --dockerfile=${WORKSPACE}/frontend/Dockerfile \
                            --destination=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            --destination=${FRONTEND_IMAGE}:latest \
                            --cleanup
                            """
                        }
                    }
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                sh """
                sed -i 's|image: .*|image: ${BACKEND_IMAGE}:${IMAGE_TAG}|' k8s/backend.yaml
                sed -i 's|image: .*|image: ${FRONTEND_IMAGE}:${IMAGE_TAG}|' k8s/frontend.yaml
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig(credentialsId: 'kubeconfig') {
                    sh '''
                    kubectl apply -f k8s/backend.yaml
                    kubectl apply -f k8s/frontend.yaml

                    kubectl rollout status deployment/ims-backend -n ims
                    kubectl rollout status deployment/ims-frontend -n ims
                    '''
                }
            }
        }
    }

    post {
        always {
            // Docker image prune is no longer needed since Kaniko doesn't use a Docker daemon host!
            echo 'Cleaning up build execution...'
        }
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}