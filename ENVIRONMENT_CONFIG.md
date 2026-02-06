# Environment Configuration Guide

## Overview
This document provides environment configuration templates for different deployment scenarios.

---

## Development Environment

### Backend - `application.yml`
```yaml
spring:
  application:
    name: euro-route-backend
  datasource:
    url: jdbc:postgresql://localhost:5432/euro_route_db
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: true
    open-in-view: false
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC

jwt:
  secret: dev-secret-key-change-in-production
  expiration: 86400000

server:
  port: 8080
  servlet:
    context-path: /

logging:
  level:
    root: INFO
    com.euroroute: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

### Frontend - `.env.development`
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

### Docker Compose - `.env.dev`
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=euro_route_db
SPRING_PROFILES_ACTIVE=dev
```

---

## Testing Environment

### Backend - `application-test.yml`
```yaml
spring:
  application:
    name: euro-route-backend-test
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password:
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
    show-sql: true
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC

jwt:
  secret: test-secret-key
  expiration: 3600000

server:
  port: 8080

logging:
  level:
    root: WARN
    com.euroroute: DEBUG
```

### Frontend - `.env.test`
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=test
```

---

## Staging Environment

### Backend - `application-staging.yml`
```yaml
spring:
  application:
    name: euro-route-backend-staging
  datasource:
    url: jdbc:postgresql://${POSTGRES_HOST:postgres-staging}:${POSTGRES_PORT:5432}/${POSTGRES_DB:euro_route_db_staging}
    username: ${POSTGRES_USER:postgres}
    password: ${POSTGRES_PASSWORD:change-me}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: false
    show-sql: false
    open-in-view: false
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC

jwt:
  secret: ${JWT_SECRET:staging-secret-change-in-production}
  expiration: 86400000

server:
  port: 8080
  servlet:
    context-path: /
  compression:
    enabled: true
    min-response-size: 1024

logging:
  level:
    root: WARN
    com.euroroute: INFO
    org.springframework.web: WARN
  file:
    name: logs/staging-app.log
  logback:
    rollingpolicy:
      max-file-size: 10MB
      max-history: 30
```

### Frontend - `.env.staging`
```env
VITE_API_URL=https://staging-api.euro-route.com/api
VITE_ENV=staging
VITE_LOG_LEVEL=info
```

### Docker Compose - `.env.staging`
```env
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=euro_route_db_staging
POSTGRES_HOST=postgres-staging
SPRING_PROFILES_ACTIVE=staging
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-staging:5432/euro_route_db_staging
SPRING_DATASOURCE_USERNAME=${POSTGRES_USER}
SPRING_DATASOURCE_PASSWORD=${POSTGRES_PASSWORD}
```

---

## Production Environment

### Backend - `application-prod.yml`
```yaml
spring:
  application:
    name: euro-route-backend-prod
  datasource:
    url: jdbc:postgresql://${POSTGRES_HOST}:${POSTGRES_PORT:5432}/${POSTGRES_DB}
    username: ${POSTGRES_USER}
    password: ${POSTGRES_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: false
        jdbc:
          batch_size: 20
          fetch_size: 50
    show-sql: false
    open-in-view: false
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

server:
  port: 8080
  servlet:
    context-path: /
  compression:
    enabled: true
    min-response-size: 1024
  tomcat:
    threads:
      max: 100
      min-spare: 10
    accept-count: 50
    max-connections: 1000

management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true

logging:
  level:
    root: WARN
    com.euroroute: INFO
    org.springframework.security: WARN
  file:
    name: /var/log/euro-route/app.log
  logback:
    rollingpolicy:
      max-file-size: 100MB
      max-history: 90
      total-size-cap: 10GB

security:
  enable-https: true
  enable-hsts: true
  cors:
    allowed-origins: ${ALLOWED_ORIGINS}
```

### Frontend - `.env.production`
```env
VITE_API_URL=https://api.euro-route.com/api
VITE_ENV=production
VITE_LOG_LEVEL=warn
VITE_SENTRY_DSN=https://your-sentry-key@sentry.io/project-id
```

### Environment Variables - `production.env`
```env
# Database
POSTGRES_HOST=db-prod.example.com
POSTGRES_PORT=5432
POSTGRES_USER=euro_route_prod
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=euro_route_db_prod

# JWT
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Application
SPRING_PROFILES_ACTIVE=prod
ALLOWED_ORIGINS=https://euro-route.com,https://www.euro-route.com

# Logging
LOG_LEVEL=INFO

# Mail (if configured)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=noreply@euro-route.com
MAIL_PASSWORD=<email-password>

# AWS/Cloud (if using)
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
```

---

## Docker Compose Examples

### Development - `docker-compose.yml`
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: euro-route-postgres-dev
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: euro_route_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - euro-route-network

  backend:
    build:
      context: ./Backend_Api
      dockerfile: Dockerfile
    container_name: euro-route-backend-dev
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/euro_route_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      SPRING_PROFILES_ACTIVE: dev
    ports:
      - "8080:8080"
    volumes:
      - ./Backend_Api/src:/app/src
    networks:
      - euro-route-network

  frontend:
    build:
      context: ./euro-route-flow
      dockerfile: Dockerfile
    container_name: euro-route-frontend-dev
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8080/api
    depends_on:
      - backend
    volumes:
      - ./euro-route-flow/src:/app/src
    networks:
      - euro-route-network

volumes:
  postgres_data_dev:

networks:
  euro-route-network:
    driver: bridge
```

### Production - `docker-compose.prod.yml`
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: euro-route-postgres-prod
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    networks:
      - euro-route-network

  backend:
    image: your-registry/euro-route-backend:1.0.0
    container_name: euro-route-backend-prod
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_PROFILES_ACTIVE: prod
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    restart: always
    networks:
      - euro-route-network

  frontend:
    image: your-registry/euro-route-frontend:1.0.0
    container_name: euro-route-frontend-prod
    ports:
      - "80:3000"
    environment:
      VITE_API_URL: https://api.euro-route.com/api
    depends_on:
      - backend
    restart: always
    networks:
      - euro-route-network

volumes:
  postgres_data_prod:

networks:
  euro-route-network:
    driver: bridge
```

---

## Deployment Commands

### Development
```bash
docker-compose -f docker-compose.yml up -d
```

### Staging
```bash
docker-compose -f docker-compose.yml \
  --env-file .env.staging \
  up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml \
  --env-file production.env \
  up -d
```

---

## Environment Variable Generation

### Generate JWT Secret
```bash
# Linux/Mac
openssl rand -base64 32

# Or using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Generate Strong Passwords
```bash
# Linux
openssl rand -base64 32

# Mac
security gen-password -l 32
```

---

## Configuration Management Best Practices

1. **Never commit secrets**
   - Use `.env` files (in .gitignore)
   - Use environment variables
   - Use secret management systems (Vault, AWS Secrets Manager)

2. **Environment-specific configs**
   - Maintain separate files for each environment
   - Override defaults with environment variables
   - Document all configuration options

3. **Validation**
   - Validate all configuration on startup
   - Fail fast if required config is missing
   - Log configuration on startup (without secrets)

4. **Secret Rotation**
   - Rotate secrets regularly
   - Update all instances simultaneously
   - Monitor for unauthorized access

5. **Monitoring**
   - Monitor configuration changes
   - Alert on failed validations
   - Maintain audit trail

---

## Troubleshooting Configuration Issues

### Database Connection Failed
- Check POSTGRES_HOST is reachable
- Verify POSTGRES_USER and POSTGRES_PASSWORD
- Ensure POSTGRES_DB exists
- Check network/firewall rules

### JWT Errors
- Verify JWT_SECRET is set and same across instances
- Check token expiration settings
- Verify token format in headers

### CORS Issues
- Check ALLOWED_ORIGINS matches frontend domain
- Verify protocol (http vs https)
- Check CORS configuration in SecurityConfig.java

### Port Already in Use
- Check no other services using the port
- Change port in configuration
- Kill process using port: `lsof -i :8080`

---

**Remember: Always validate configuration in test environment first before production deployment!**
