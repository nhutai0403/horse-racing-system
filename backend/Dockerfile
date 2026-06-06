# --- Build Stage ---
FROM maven:3.9.16-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies (cached layer)
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B
COPY src ./src
# Build application jar
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests

# --- Runtime Stage ---
FROM eclipse-temurin:17-jre
WORKDIR /app
# Create non-root user for security
RUN groupadd -g 1001 appuser && useradd -r -u 1001 -g appuser appuser
RUN mkdir -p uploads && chown -R appuser:appuser /app
COPY --from=builder --chown=appuser:appuser /app/target/*.jar app.jar
# Use read-only root filesystem where possible
RUN chmod 444 app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
