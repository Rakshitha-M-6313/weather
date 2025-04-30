FROM openjdk:8-jdk-slim

WORKDIR /app

COPY target/devops-integration.jar /app/devops-integration.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/devops-integration.jar"]
