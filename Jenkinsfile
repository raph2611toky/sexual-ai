pipeline {
    agent any

    environment {
        BACKEND_DOCKER_IMAGE = "sexualai_backend"
        BACKEND_DOCKER_NAME = "sexualai-backend"
        FRONTEND_DOCKER_IMAGE = "sexualai_web"
        FRONTEND_DOCKER_NAME = "sexualai-web"
        APP_NETWORK = "sexualai-network"
        DOCKER_TAG = "latest"
        ENV_FILE = ".env"
        BACKEND_PORT = "8569"
        FRONTEND_PORT = "8568"
    }

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'git_branch', value: '$ref'],
                [key: 'git_commit', value: '$after']
            ],
            token: 'HyejkWeUlMjmfLbiF9sLk1VhIeT3fAOz29KNiD6aNzLz7dGCxH11lFi8YB4qQMbcAI3BLL3CH0JLVNa4VNVRpDjxERCOR5noZ2l9HFSxTtIJWkP500TNiTm5otkdnkYFmU3Tt9Vis0RfZl3fU4kXtsAho3IKDmPCoAeQHcdYHEQFHVtXVuejLR0kOYq46OucLxDsXoMCEpvdGeRqrbToxWCOxd4S3D4PhJVReTIVl9mp2ds9Df6fDcCP3xAK5uUOqPfdvTA9iM7VhNxoX3JSlSseyVrNQnkw38sDbaivmvYW0pNslMU0nm4m2KEzk5Wc7HMlxmYcoZTt92P4goctqDGd4ICxjotydhMVvUnWBH6gDTND5kwSewrk2p6qVyRedEtg7CUzoaPZ6oud',
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
                    branch 'rebuild'
                    branch 'web'
                }
            }
            steps {
                sh '''
                    [ -f .env.build ] && rm .env.build
                    cp backend/.env .env.build
                '''
            }
        }

        stage('Build Backend Docker Image') {
            when {
                anyOf {
                    branch 'backend'
                    branch 'rebuild'
                }
            }
            steps {
                sh "docker build --build-arg BRANCH_NAME=${env.BRANCH_NAME} -t ${BACKEND_DOCKER_IMAGE}:${DOCKER_TAG} -f backend/Dockerfile ."
            }
        }

        // stage('Build web Docker Image') {
        //     when {
        //         branch 'web'
        //     }
        //     steps {
        //         sh "docker build --build-arg BRANCH_NAME=${env.BRANCH_NAME} -t ${FRONTEND_DOCKER_IMAGE}:${DOCKER_TAG} -f frontend-web/Dockerfile ."
        //     }
        // }

        stage('Deploy Backend') {
            when {
                anyOf {
                    branch 'backend'
                    branch 'rebuild'
                }
            }
            steps {
                script {
                    sh "docker network create ${APP_NETWORK} || true"
                    sh "docker stop ${BACKEND_DOCKER_NAME} || true && docker rm ${BACKEND_DOCKER_NAME} || true"

                    def backendCommands = ""
                    if (env.BRANCH_NAME == 'rebuild') {
                        backendCommands = """
                            python manage.py reset_db --noinput && \
                            rm -rf apps/*/migrations/0* && \
                            rm -rf **/__pycache__ && \
                            python manage.py makemigrations && \
                            python manage.py migrate && \
                            python manage.py collectstatic --noinput && \
                            python manage.py seed_symptom && \
                            exec gunicorn --bind 0.0.0.0:${BACKEND_PORT} config.wsgi:application
                        """
                    } else {
                        backendCommands = """
                            python manage.py collectstatic --noinput && \
                            python manage.py seed_symptom && \
                            exec gunicorn --bind 0.0.0.0:${BACKEND_PORT} config.wsgi:application
                        """
                    }

                    sh """
                        docker run -d --name ${BACKEND_DOCKER_NAME} \
                            --env-file .env.build \
                            --network ${APP_NETWORK} \
                            --add-host=host.docker.internal:host-gateway \
                            -v \$WORKSPACE/backend/media:/app/media \
                            -p 0.0.0.0:${BACKEND_PORT}:8569 \
                            ${BACKEND_DOCKER_IMAGE}:${DOCKER_TAG} \
                            /bin/bash -c '
                                ls
                                pwd
                                ${backendCommands}
                            '
                    """
                    sh "sleep 10 && curl -f http://127.0.0.1:${BACKEND_PORT}/ || echo '⚠️ Le backend ne répond pas encore...'"
                }
            }
        }

        // stage('Deploy Frontend web') {
        //     when {
        //         branch 'web'
        //     }
        //     steps {
        //         script {
        //             sh "docker network create ${APP_NETWORK} || true"
        //             sh "docker stop ${FRONTEND_DOCKER_NAME} || true && docker rm ${FRONTEND_DOCKER_NAME} || true"

        //             sh """
        //                 docker run -d --name ${FRONTEND_DOCKER_NAME} \
        //                     --env-file .env.build \
        //                     --network ${APP_NETWORK} \
        //                     -p 127.0.0.1:${FRONTEND_PORT}:80 \
        //                     ${FRONTEND_DOCKER_IMAGE}:${DOCKER_TAG}
        //             """
        //             sh "sleep 10 && curl -f http://127.0.0.1:${FRONTEND_PORT}/ || echo '⚠️ Le frontend ne répond pas encore...'"
        //         }
        //     }
        // }
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