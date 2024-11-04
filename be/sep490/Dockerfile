# FROM maven:3.8.6-eclipse-temurin-17-alpine as builder
FROM maven:3.8.6-eclipse-temurin-17-alpine as builder
WORKDIR /app
COPY . .
RUN mvn install -DskipTests=true
#VOLUME /tmp

# FROM amazoncorretto:17.0.11-al2023-headless
FROM eclipse-temurin:17-jre
WORKDIR /run
COPY --from=builder /app/target/sep490-0.0.1-SNAPSHOT.jar /run/sep490.jar
EXPOSE 9000
ENTRYPOINT ["java","-jar","/run/sep490.jar"]
