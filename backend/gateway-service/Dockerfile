FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/gateway-service-1.0.0.jar
COPY \ app.jar
EXPOSE 1011
ENTRYPOINT ["java","-jar","/app/app.jar"]
