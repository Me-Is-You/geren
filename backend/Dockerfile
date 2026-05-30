FROM maven:3.9-eclipse-temurin-17 AS build
ARG SERVICE
WORKDIR /workspace
COPY pom.xml ./
COPY common ./common
COPY gateway-service ./gateway-service
COPY user-service ./user-service
COPY article-service ./article-service
COPY project-service ./project-service
COPY comment-service ./comment-service
COPY statistics-service ./statistics-service
RUN mvn -q -pl ${SERVICE} -am -DskipTests package

FROM eclipse-temurin:17-jre-alpine
ARG SERVICE
WORKDIR /app
COPY --from=build /workspace/${SERVICE}/target/*.jar /app/app.jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
