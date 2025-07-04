pipeline {
    agent any

    environment {
        BACKEND_DOCKER_IMAGE = "sexualai_backend"
        FRONTEND_DOCKER_IMAGE = "sexualai_frontend"
        DOCKER_TAG = "latest"
        ENV_FILE = ".env"
        BACKEND_PORT = "8000"
        FRONTEND_PORT = "8080"
    }

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'git_branch', value: '$ref'],
                [key: 'git_commit', value: '$after']
            ],
            token: 'ZOeMV4oZGa5MYutFwy8rGKbN3rVU57SSQmcYXuFbcwoQlB8dmaT9KcK9wi3nXV1WHsKKfWRPtNXT3G8J3lmXfvCaTjcXtp4YZVzSzQVsB2wozUmnbxS6cj42m6iI6XiKP40RjV9A75ymz5v9rA5ULjs9ZJMP0aawmTAzBoomFXnqPrOzRDVP4hjlDYFd8RODYzTwCqidYR67vBMeNipIBq4w1Kvzt8f55Ln5NzAeTjESV9fqlw5eGoQqlCKPzwkfucqLxFuhFOQ0SpifTQiWsabYdtYcOZtnyxtWn6oLtgUMMick6iYyC0tM9trYLls9WFsZQlaxYim17g2fqqJjZHpB6MkH3u23YVnmjpnW3HkVoTS9orlDKtZoFXVnlL1BAzayFnlun65hdgVh',
            printContributedVariables: true,
            printPostContent: true
        )
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare .env') {
            when {
                anyOf {
                    branch 'backend'
                    branch 'web'
                }
            }
            steps {
                sh '''
                    [ -f .env.build ] && rm .env.build
                    cp .env .env.build
                '''
            }
        }

        stage('Build Backend Docker Image') {
            when {
                branch 'backend'
            }
            steps {
                sh "docker build --build-arg BRANCH_NAME=${env.BRANCH_NAME} -t ${BACKEND_DOCKER_IMAGE}:${DOCKER_TAG} -f Dockerfile.backend ."
            }
        }

        stage('Build Frontend Docker Image') {
            when {
                branch 'frontend'
            }
            steps {
                sh "docker build --build-arg BRANCH_NAME=${env.BRANCH_NAME} -t ${FRONTEND_DOCKER_IMAGE}:${DOCKER_TAG} -f Dockerfile.frontend ."
            }
        }

        stage('Deploy Backend') {
            when {
                branch 'backend'
            }
            steps {
                script {
                    sh "docker network create sexualai-network || true"
                    sh "docker stop sexualai-backend || true && docker rm sexualai-backend || true"

                    sh """
                        docker run -d --name sexualai-backend \
                            --env-file .env.build \
                            --network sexualai-network \
                            -v \$WORKSPACE/media:/app/media \
                            -p 127.0.0.1:${BACKEND_PORT}:8000 \
                            ${BACKEND_DOCKER_IMAGE}:${DOCKER_TAG} \
                            /bin/bash -c '
                                python manage.py makemigrations && \
                                python manage.py migrate && \
                                python manage.py collectstatic --noinput && \
                                exec gunicorn --bind 0.0.0.0:8000 config.wsgi:application
                            '
                    """
                    sh "sleep 10 && curl -f http://127.0.0.1:${BACKEND_PORT}/ || echo '⚠️ Le backend ne répond pas encore...'"
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                branch 'frontend'
            }
            steps {
                script {
                    sh "docker network create sexualai-network || true"
                    sh "docker stop sexualai-frontend || true && docker rm sexualai-frontend || true"

                    sh """
                        docker run -d --name sexualai-frontend \
                            --env-file .env.build \
                            --network sexualai-network \
                            -p 127.0.0.1:${FRONTEND_PORT}:80 \
                            ${FRONTEND_DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                    sh "sleep 10 && curl -f http://127.0.0.1:${FRONTEND_PORT}/ || echo '⚠️ Le frontend ne répond pas encore...'"
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline terminé avec succès.'
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
        }
        failure {
            echo '❌ Le pipeline a échoué.'
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
        }
    }
}