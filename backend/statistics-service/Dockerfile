FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/statistics-service-1.0.0.jar
COPY \ app.jar
EXPOSE 1016
ENTRYPOINT ["java","-jar","/app/app.jar"]
