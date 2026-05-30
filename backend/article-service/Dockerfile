FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/article-service-1.0.0.jar
COPY \ app.jar
EXPOSE 1013
ENTRYPOINT ["java","-jar","/app/app.jar"]
