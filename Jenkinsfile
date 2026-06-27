pipeline {

    agent any

    environment {
        BACKEND_IMAGE = "IncidentManagementSystem/backend"
        FRONTEND_IMAGE = "IncidentManagementSystem/frontend"
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
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test'
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Build Images') {
            parallel {

                stage('Backend Image') {
                    steps {
                        sh """
                        docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                        """
                    }
                }

                stage('Frontend Image') {
                    steps {
                        sh """
                        docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                        """
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                script {

                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds') {

                        sh """
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest

                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        """
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
            sh 'docker image prune -f'
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}