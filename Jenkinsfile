@Library(['scanhub', 'codeql-linux'])_

import hudson.Util;
pipeline {
  parameters {
        booleanParam(name: 'OIS_SCAN', defaultValue: false, description: 'OIS SwA Scans')
        booleanParam(name: 'PUBLISH', defaultValue: false, description: 'Publish component to registry.')
  }
  agent {
    kubernetes {
      label 'mobile-framework-js-build'
      defaultContainer 'buildtools'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    image-build: mobile-framework-js
spec:
  containers:
  - name: node
    image: node:16.15.0
    command:
    - cat
    tty: true
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
      VERSION = "1.0.0"
      SERVICE_NAME = 'mobile-framework-js'
      DTR_URL = "${env.DTR_URL}"
      DTR_DIR = "/${env.DTR_DIR}"
      PATH_TO_APP = ""
      REPORTS_URL = "coderepo.mobilehealth.va.gov/scm/msl/quality-reports.git"
      CNESREPORT_JAR = "${env.CNESREPORT_JAR}"
      CNES_JAR_LOCATION = "${env.CNES_JAR_LOCATION}"      
  }

  triggers { cron(scanhubCron()) }

  stages {

    stage('Initialize CodeQL') {
      when { expression { params.OIS_SCAN || isScanhubCron() } }
      steps {
        initCodeQL("javascript")
      }
    }

 stage('Test') {
      steps {
        withCredentials([
          string(credentialsId: 'VA_NEXUS_PWD', variable: 'VA_NEXUS_PWD'),
          string(credentialsId: 'VA_NEXUS_USER', variable: 'VA_NEXUS_USER'),
          string(credentialsId: 'MAP_DTR_PWD', variable: 'MAP_DTR_PWD'),
          string(credentialsId: 'MAP_DTR_USER', variable: 'MAP_DTR_USER'),
          string(credentialsId: 'VA_GL_PWD', variable: 'VA_GL_PWD'),
          string(credentialsId: 'VA_GL_USER', variable: 'VA_GL_USER'),
          usernamePassword(credentialsId: '76ec1690-dbb5-49a5-82b3-df29b41d60ba',  passwordVariable: 'VA_BITBT_PWD', usernameVariable: 'VA_BITBT_USER')
          ]) {
            container('node') {
              dir('./') {
                sh """
                  npm install
                  npm run coverage
                """

                archiveArtifacts artifacts: "coverage/*"

                sh """
                  git clone https://${VA_BITBT_USER}:${VA_BITBT_PWD}@${REPORTS_URL} || true
                  git config --global user.email user@va.gov
                  git config --global user.name ${VA_BITBT_USER}
                  mkdir -p ./quality-reports/${SERVICE_NAME}-v${VERSION}
                  echo "mkdir -p -m a=rw ./quality-reports/${SERVICE_NAME}-v${VERSION}"
                  cp coverage/tmp/*.json quality-reports/${SERVICE_NAME}-v${VERSION}
                  cd quality-reports
                  git add * && git commit -m 'new test report' && git push --set-upstream origin master
                  cd ..
                  rm -fr quality-reports
                """
              }
            }
        }
      }
    }

     stage('Sonar Scan') {
      steps {
        withCredentials([
          string(credentialsId: 'VA_NEXUS_PWD', variable: 'VA_NEXUS_PWD'),
          string(credentialsId: 'VA_NEXUS_USER', variable: 'VA_NEXUS_USER'),
          string(credentialsId: 'MAP_DTR_PWD', variable: 'MAP_DTR_PWD'),
          string(credentialsId: 'MAP_DTR_USER', variable: 'MAP_DTR_USER'),
          string(credentialsId: 'VA_GL_PWD', variable: 'VA_GL_PWD'),
          string(credentialsId: 'VA_GL_USER', variable: 'VA_GL_USER'),
          string(credentialsId: 'MAP_SONARQUBE_API', variable: 'MAP_SONARQUBE_API'),
          usernamePassword(credentialsId: '76ec1690-dbb5-49a5-82b3-df29b41d60ba',  passwordVariable: 'VA_BITBT_PWD', usernameVariable: 'VA_BITBT_USER')
        ]) {
          container('node') {
            dir('./') {
              withSonarQubeEnv('SonarQube') {
                /* Run the sonar scan */
                sh """
                  npm install
                  npm run coverage
                """
                
                archiveArtifacts artifacts: "coverage/*"

                sh "node_modules/sonarqube-scanner/src/bin/sonar-scanner -Dsonar.sources=src -Dsonar.tests=src/tests -Dsonar.test.inclusions=mobile-framework-js/src/tests -Dsonar.scm.exclusions.disabled=true  -Dsonar.projectName=mobile-framework-js -Dsonar.projectKey=mobile-framework-js -Dsonar.host.url=${SONARQUBE_URL} -Dsonar.login=${MAP_SONARQUBE_API} -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info -Dsonar.clover.reportPath=coverage/clover.xml"
              }
            }
          }
          container('buildtools') {
            dir('./') {
                /* Download the CNES Report Generation Tool */
                sh "curl -u ${VA_NEXUS_USER}:${VA_NEXUS_PWD} ${CNES_JAR_LOCATION}/${CNESREPORT_JAR} -O"
                /* Create a Report of the Sonar Results */
                sh "java -jar ${CNESREPORT_JAR} -t ${MAP_SONARQUBE_API} -s ${SONARQUBE_URL} -p mobile-framework-js"
                /* Archive the report */
                archiveArtifacts artifacts: "*analysis-report.md"
                /* Push report to bitbucket */
                /* Archive the report */
                archiveArtifacts artifacts: "*analysis-report.md"
                /* Push report to bitbucket */
                sh """
                  git clone https://${VA_BITBT_USER}:${VA_BITBT_PWD}@${REPORTS_URL} || true
                  git config --global user.email user@va.gov
                  git config --global user.name ${VA_BITBT_USER}
                  mkdir -p ./quality-reports/${SERVICE_NAME}-v${VERSION}
                  cp *report.md ./quality-reports/${SERVICE_NAME}-v${VERSION}
                  cd quality-reports
                  git add * && git commit -m 'new analysis report' && git push --set-upstream origin master
                  cd ..
                  rm -fr quality-reports
                """
            }
          }
        }
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
              sh "chmod +x ./build.sh"              
            } // container
          } // withCredentials
        } // script
      } // steps
    } // stage

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