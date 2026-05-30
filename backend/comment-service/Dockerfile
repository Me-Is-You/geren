FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/comment-service-1.0.0.jar
COPY \ app.jar
EXPOSE 1015
ENTRYPOINT ["java","-jar","/app/app.jar"]
