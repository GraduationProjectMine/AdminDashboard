pipeline {
    agent any

    environment {
        REGISTRY   = "docker.io"
        IMAGE_NAME = "nguyentt07/certificate-app-admin"
        TAG        = "dev-${env.BUILD_NUMBER}"
        // Cùng backend với frontend chính, chỉ khác tên biến do code admin dùng NEXT_PUBLIC_API_BASE_URL
        NEXT_PUBLIC_API_BASE_URL = "https://api.100-77-202-105.sslip.io"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Environment') {
            steps {
                sh '''
                    node -v
                    npm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    if [ -f package-lock.json ]; then
                        npm ci
                    else
                        npm install
                    fi
                '''
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint --if-present || true'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test --if-present || true'
            }
        }

        stage('Build & Push Image to Registry') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'REG_USER',
                        passwordVariable: 'REG_PASS'
                    ),
                    string(credentialsId: 'admin-sepolia-rpc-url', variable: 'RPC_URL'),
                    string(credentialsId: 'admin-sepolia-contract-address', variable: 'CONTRACT_ADDR')
                ]) {
                    sh '''
                    echo "$REG_PASS" | docker login "$REGISTRY" -u "$REG_USER" --password-stdin
                    docker build \
                        --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
                        --build-arg NEXT_PUBLIC_RPC_URL="$RPC_URL" \
                        --build-arg NEXT_PUBLIC_CONTRACT_ADDRESS="$CONTRACT_ADDR" \
                        -t "$IMAGE_NAME:$TAG" .
                    docker push "$IMAGE_NAME:$TAG"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'cert-dev-kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                    export KUBECONFIG="$KUBECONFIG_FILE"
                    kubectl set image deployment/admin-deployment \
                        admin="$IMAGE_NAME:$TAG" -n blockchain-dev
                    kubectl rollout status deployment/admin-deployment \
                        -n blockchain-dev --timeout=120s
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Admin Dashboard CI/CD succeeded: ${IMAGE_NAME}:${TAG} deployed to blockchain-dev"
        }
        failure {
            echo 'Admin Dashboard CI/CD failed. Please check the Console Output.'
        }
        always {
            deleteDir()
        }
    }
}   