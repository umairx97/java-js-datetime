def dateStamp = Calendar.getInstance().getTime().format('YYYYMMdd-hhmmss',TimeZone.getTimeZone('CST'))
println "Date Stamp is ${dateStamp}"

pipeline {
  parameters {
        string(name: 'DEPLOY_VERSION', defaultValue: '1.0.0', description: 'Version to Deploy')
        string(name: 'NS', defaultValue: 'sqa', description: 'Only used if DEPLOY_ONLY is true')
        choice(name: 'DEPLOY_ONLY', choices: ['false' , 'true'], description: 'Only Run Deploy stage')
	choice(name: 'RUN_VV', choices: ['false', 'true'], description: 'Do you want to run V&V?')
        choice(name: 'VV_DRY_RUN', choices: ['false', 'true'], description: 'If true, will not push reports to coderepo and will not create Jira ticket requesting review.')
        choice(name: 'VV_COMMAND', choices: ['report', 'request-review', 'validate', 'release',], description: 'V&V command to run')
  
  }
  agent {
    kubernetes {
      label 'mobile-framework-js-build'
      defaultContainer 'maven'
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
  - name: maven
    image: ${env.MAVEN_JDK11_BUILD_IMAGE}
    volumeMounts:
    - name: shared-data
      mountPath: /pod-data
    env:
    - name: DOCKER_HOST
      value: tcp://localhost:2375
    command:
    - cat
    tty: true
  - name: docker
    image: docker:18.06
    env:
    - name: DOCKER_HOST
      value: tcp://localhost:2375
    command:
    - cat
    tty: true
  - name: k8-deploy
    image: ${env.K8_DEPLOY_IMAGE}
    command:
    - cat
    tty: true
  - name: dind-daemon
    image: ${env.DIND_IMAGE}
    securityContext:
      privileged: true
    args:
    - --storage-driver=overlay2
    ports:
    - containerPort: 2375
    volumeMounts:
    - name: docker-graph-storage
      mountPath: /var/lib/docker
    tty: true
  imagePullSecrets:
  - name: ${env.IMAGE_PULL_SECRET}
  volumes:
  - name: docker-graph-storage
    emptyDir: {}
  - name: shared-data
    emptyDir: {}
"""
    }
  }

  environment {
      NAMESPACE = "${env.SHAREDSERVICESNAMESPACE}"
      BUILD_TYPE = 'veteran'
      VERSION = "1.0.0"
      SERVICE_NAME = 'mobile-framework-js'
      DTR_URL = "${env.DTR_URL}"
      DTR_DIR = "/${env.DTR_DIR}"
      PATH_TO_APP = ""
      REPORTS_URL = "coderepo.mobilehealth.va.gov/scm/msl/quality-reports.git"

      CNESREPORT_JAR = "${env.CNESREPORT_JAR}"
      CNES_JAR_LOCATION = "${env.CNES_JAR_LOCATION}"      
  }

  stages {
    stage('Start') {
      steps {
         // send build started notifications
         slackSend (color: '#FFFF00', message: "STARTED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${VERSION})")
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
              dir('./src') {
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
            dir('./src') {
              withSonarQubeEnv('SonarQube') {
                /* Run the sonar scan */
                sh "node_modules/sonarqube-scanner/dist/bin/sonar-scanner -Dsonar.sources=src -Dsonar.tests=src -Dsonar.test.inclusions=mobile-framework-js/src/tests -Dsonar.scm.exclusions.disabled=true  -Dsonar.projectName=mobile-framework-js -Dsonar.projectKey=mobile-framework-js -Dsonar.host.url=${SONARQUBE_URL} -Dsonar.login=${MAP_SONARQUBE_API} -Dsonar.javascript.lcov.reportPaths=coverage/${dateStamp}_lcov.info -Dsonar.clover.reportPath=coverage/${dateStamp}_clover.xml"
              }
            }
          }
          container('maven') {
            dir('./src') {
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

    stage('Quality Gate') {
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
            container('maven') {

              timeout(time: 5, unit: 'MINUTES') {
                waitForQualityGate abortPipeline:  true
              }

            }
        } //withCredentials
      } //steps
    } //stage
  } // stages

  post {
    always {
      cleanWs() /* clean up our workspace */
    }
    success {
      slackSend (color: '#00FF00', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${VERSION})")
    }

    failure {
      slackSend (color: '#FF0000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${VERSION})")
    }
  }
}
