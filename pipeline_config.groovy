dockerImage = "kenvue.jfrog.io/ts-docker/node18-python3:18.19"
ARTIFACTORY_CREDENTIALS = 'katalyst-jfrog-login'
libraries {
    npm
    helm
}


application_environments{

    dev{
        DEPLOY_LIB_BRANCH_NAME = 'dev'
        DEPLOY_LIB_EKS_AWS_CREDS = 'sip-katalyst-aws-credentials' 
        DEPLOY_LIB_HELM_VALUES_YAML_FILE_PATH = 'helm-chart-deployment/values.yaml'
        DEPLOY_LIB_HELM_CHART_PATH = 'helm-chart-deployment'
        DEPLOY_LIB_HELM_RELEASE_NAME = 'rdx-sip-bs-ms'
        DEPLOY_LIB_AWS_REGION = 'us-east-1'
        DEPLOY_LIB_EKS_CLUSTER_NAME = 'itx-wkn-sipcluster-development'
        DEPLOY_LIB_NAMESPACE_NAME = 'sip-namespace'
        DEPLOY_LIB_NAMESPACE_FILE_PATH = 'katalyst-nodejs-helm-ns.yaml'
    //DEPLOY_LIB_IMAGE_TAG = 'v1.2.3'(optional, if you want deploy specific image tag we need this variable) .
    }
    
   prod {
        DEPLOY_LIB_BRANCH_NAME = 'prod'
        DEPLOY_LIB_EKS_AWS_CREDS = 'sip-katalyst-aws-credentials-qa-prod' 
        DEPLOY_LIB_HELM_VALUES_YAML_FILE_PATH = 'helm-chart-deployment/values.yaml'
        DEPLOY_LIB_HELM_CHART_PATH = 'helm-chart-deployment'
        DEPLOY_LIB_HELM_RELEASE_NAME = 'rdx-sip-bs-ms'
        DEPLOY_LIB_AWS_REGION = 'us-east-1'
        DEPLOY_LIB_EKS_CLUSTER_NAME = 'itx-wks-sipcluster-qa'
        DEPLOY_LIB_NAMESPACE_NAME = 'sip-namespace'
        DEPLOY_LIB_NAMESPACE_FILE_PATH = 'katalyst-nodejs-helm-ns.yaml'
    //DEPLOY_LIB_IMAGE_TAG = 'v1.2.3'(optional, if you want deploy specific image tag we need this variable) .
    }

}

