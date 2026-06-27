pipeline{
    agent any
    environment{
        BACKEND_IMAGE = 'IncidentManagementSystem/backend'
        FRONTEND_IMAGE = 'IncidentManagementSystem/frontend'
        IMAGE_TAG = '${BUILD_NUMBER}'
    }
    tools {
        nodejs "nodejs"
    }

    stages{
        stage('Git checkout'){
            steps{
                echo "Checking out the code from Github"
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github', url: 'https://www.github.com/Amogh052003/Incident-Management-System']])
            }
        }

        stage('Install dependencies'){
            steps{
                sh 'npm ci'
            }
        }

        stage ('Run tests'){
            steps{
                sh 'npm test'
            }
        }

        stage('Build Docker image - backend'){
                steps {
                    sh """
                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                    """
            }
        }

        stage('Build Docker image - frontend'){
                steps {
                    sh """
                    docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \2
                        ./frontend
                    """
            }
        }

        stage('Push Docker image - backend'){
            script{
                docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds'){
                    steps {
                        sh """
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Push Docker image - frontend'){
            steps{
                script{ 
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds'){
                        sh """
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes'){
            steps{
                sh 'kubectl apply -f k8s/backend.yaml'
                sh 'kubectl apply -f k8s/frontend.yaml'
            }
        }
    }
}
