@Library(['scanhub', 'codeql-linux'])_

import hudson.Util;
pipeline {
  parameters {
        booleanParam(name: 'OIS_SCAN', defaultValue: false, description: 'OIS SwA Scans')
        booleanParam(name: 'PUBLISH', defaultValue: false, description: 'Publish component to registry.')
  }
  agent {
    kubernetes {
      label 'mobile-framework-js'
      defaultContainer 'buildtools'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    image-build: mobile-framework-js
spec:
  containers:
  - name: jnlp
    securityContext:
      runAsUser: 10000
    resources:
      limits:
        memory: 2Gi
        cpu: 2
      requests:
        memory: 1Gi
        cpu: 1
  - name: buildtools
    image: ${env.BROWSERTEST_IMAGE}
    volumeMounts:
    - name: shared-data
      mountPath: /pod-data
    env:
    - name: DOCKER_HOST
      value: tcp://localhost:2375
    command:
    - cat
    tty: true
  ${scanhub.SCANHUB_CONTAINERS}
  imagePullSecrets:
  - name: ${env.IMAGE_PULL_SECRET}
  volumes:
  - name: shared-data
    emptyDir: {}
  - name: docker-graph-storage
    emptyDir: {}
"""
    } // kubernetes
  } // agent

  environment {
    SERVICE_NAME = "mobile-framework-js"
    SERVICE_VERSION = "1.0.0"
    BRANCH_NAME = "${env.BRANCH_NAME}"
    REPORTS_REPO = "coderepo.mobilehealth.va.gov/scm/msl/quality-reports.git"
  } // environment

  triggers { cron(scanhubCron()) }

  stages {

    stage('Initialize CodeQL') {
      when { expression { params.OIS_SCAN || isScanhubCron() } }
      steps {
        initCodeQL("javascript")
      }
    }

    stage('Build and Test') {
      steps {
        script {
          withCredentials([
                           string(credentialsId: 'VA_NEXUS_PWD', variable: 'VA_NEXUS_PWD'),
                           string(credentialsId: 'VA_NEXUS_USER', variable: 'VA_NEXUS_USER'),
                           string(credentialsId: 'DTR_USER', variable: 'DTR_USER'),
                           string(credentialsId: 'DTR_PWD', variable: 'DTR_PWD')
                          ]) {
            container('buildtools') {
              sh 'chmod +x ./build.sh'
            } // container
          } // withCredentials
        } // script
      } // steps
    } // stage

    stage('Sonar Scan') {
      steps {
        script {
          withCredentials([
                           string(credentialsId: 'VA_NEXUS_PWD', variable: 'VA_NEXUS_PWD'),
                           string(credentialsId: 'VA_NEXUS_USER', variable: 'VA_NEXUS_USER'),
                           string(credentialsId: 'VA_BITBT_PWD', variable: 'VA_BITBT_PWD'),
                           string(credentialsId: 'VA_BITBT_USER', variable: 'VA_BITBT_USER'),
                           string(credentialsId: 'MAP_SONARQUBE_API', variable: 'MAP_SONARQUBE_API')
                          ]) {
            container('buildtools') {
              withSonarQubeEnv ('SonarQube') {
                /* Sonar scan */
                sh '''
                  export NODE_TLS_REJECT_UNAUTHORIZED=0
                  export NODE_EXTRA_CA_CERTS='/etc/ssl/certs/ca-bundle.crt'
                  export SONAR_SCANNER_OPTS='-Djavax.net.ssl.trustStore=/usr/java/latest/lib/security/cacerts'
                  node_modules/sonarqube-scanner/src/bin/sonar-scanner -Dsonar.host.url=${SONARQUBE_URL} -Dsonar.token=${MAP_SONARQUBE_API} -DskipTests
                '''
                
		/* Push report to repo */
                sh '''
                  curl -u ${VA_NEXUS_USER}:${VA_NEXUS_PWD} ${CNES_JAR_LOCATION}/${CNESREPORT_JAR} -O
                  java -jar ${CNESREPORT_JAR} -t ${MAP_SONARQUBE_API} -s ${SONARQUBE_URL} -p ${SERVICE_NAME} -b ${BRANCH_NAME}

                  git clone https://${VA_BITBT_USER}:${VA_BITBT_PWD}@${REPORTS_REPO}
                  git config --global user.email noemail
                  git config --global user.name Jenkins

                  REPORT_DIR=quality-reports/$SERVICE_NAME/$SERVICE_VERSION
                  [ -d $REPORT_DIR ] || mkdir -p $REPORT_DIR

                  cp *report.md $REPORT_DIR/${SERVICE_NAME}-${SERVICE_VERSION}-sonar.md

                  cd quality-reports
                  git add .
                  DATE=$(date "+%Y%m%d-%H%M%S")
                  git commit -m "$VAMF_ENVIRONMENT pipeline Sonar report for $SERVICE_NAME:$SERVICE_VERSION $DATE" || true
                  git push --set-upstream origin master
                '''
              } // withSonarQubeEnv
            } // container
          } // withCredentials
        } // script
      } // steps
    } // stage Sonar Scan

    stage('OIS SwA') {
      when { expression { params.OIS_SCAN } }
      steps {
        oisScan("javascript", "RIPM")
      }
    }

    stage('Publish') {
      when {
        expression {
          params.PUBLISH == true
        }
      }
      steps {
        script {
          withCredentials([
                           string(credentialsId: 'VA_NEXUS_PWD', variable: 'VA_NEXUS_PWD'),
                           string(credentialsId: 'VA_NEXUS_USER', variable: 'VA_NEXUS_USER')
                          ]) {
            container('buildtools') {
              sh 'chmod +x ./publish.sh'
            } // container
          } // withCredentials
        } // script
      } // steps
    } // stage
  } // stages

  post {
    always {
      cleanWs() /* clean up our workspace */
    } // always
  } // post
} // pipeline