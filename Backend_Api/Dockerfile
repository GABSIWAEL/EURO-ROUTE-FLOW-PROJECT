# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy Maven settings for network resilience
COPY settings.xml /root/.m2/settings.xml

COPY pom.xml .

# Download dependencies with retry configuration
RUN mvn dependency:go-offline -Dmaven.wagon.http.retryHandler.count=5 || mvn dependency:go-offline -Dmaven.wagon.http.retryHandler.count=5 || true

COPY src ./src

# Build with retry configuration
RUN mvn clean package -DskipTests -Dmaven.wagon.http.retryHandler.count=5 || mvn clean package -DskipTests -Dmaven.wagon.http.retryHandler.count=5

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
