# Euro Route Backend Migration Guide

## Overview
This project has been successfully migrated from Supabase to a Spring Boot backend with PostgreSQL. The frontend (React/Vite) now communicates with the Spring Boot API instead of Supabase.

## Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL 16
- **ORM**: JPA/Hibernate
- **Authentication**: JWT-based (custom implementation)
- **API**: RESTful

### Frontend (React)
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **API Client**: Custom HTTP client

### Database
- **Engine**: PostgreSQL 16
- **Migrations**: Flyway
- **Container**: Docker

## Project Structure

```
.
├── Backend_Api/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── src/main/
│   │   ├── java/com/euroroute/
│   │   │   ├── EuroRouteApplication.java
│   │   │   ├── controller/        # REST Controllers
│   │   │   ├── service/           # Business Logic
│   │   │   ├── repository/        # Data Access Layer
│   │   │   ├── entity/            # JPA Entities
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   └── security/          # JWT & Security Config
│   │   └── resources/
│   │       ├── application.yml    # Spring Boot Config
│   │       └── db/migration/      # Database Migrations
│   └── target/                    # Build output
├── euro-route-flow/
│   ├── src/
│   │   ├── integrations/api/
│   │   │   └── client.ts          # API Client
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx    # Auth Context (updated)
│   │   ├── components/            # React Components (updated)
│   │   └── pages/                 # React Pages (updated)
│   └── Dockerfile
└── docker-compose.yml
```

## Database Schema

The database includes the following tables:

### users
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `full_name`
- `role` (ADMIN, STAFF, DRIVER)
- `is_active`
- `created_at`, `updated_at`

### drivers
- `id` (UUID, Primary Key)
- `full_name`
- `phone` (Unique)
- `email` (Unique)
- `is_active`
- `vehicle_info`
- `created_at`, `updated_at`

### delivery_requests
- `id` (UUID, Primary Key)
- `client_name`, `client_phone`, `client_email`
- `pickup_address`, `delivery_address`
- `item_type`, `item_size`, `item_weight`
- `requested_date`, `requested_time`
- `status` (EN_ATTENTE, EN_COURS, LIVRE)
- `assigned_driver_id` (Foreign Key)
- `client_notes`, `internal_notes`
- `tracking_number`
- `created_at`, `updated_at`, `completed_at`

### contact_messages
- `id` (UUID, Primary Key)
- `name`, `email`, `subject`, `message`
- `is_read`
- `created_at`

## Running the Application

### Option 1: Docker Compose (Recommended)

```bash
cd /path/to/rafik4\ with\ springbackend
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Spring Boot API on port 8080
- React frontend on port 5173

### Option 2: Local Development

#### Start PostgreSQL
```bash
docker run -d \
  --name euro-route-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=euro_route_db \
  -p 5432:5432 \
  postgres:16-alpine
```

#### Build and Run Backend
```bash
cd Backend_Api
mvn clean install
mvn spring-boot:run
```

#### Run Frontend
```bash
cd euro-route-flow
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Delivery Requests
- `POST /api/delivery-requests` - Create request (public)
- `GET /api/delivery-requests` - Get all requests
- `GET /api/delivery-requests/:id` - Get request by ID
- `GET /api/delivery-requests/status/:status` - Filter by status
- `GET /api/delivery-requests/driver/:driverId` - Get driver's deliveries
- `PUT /api/delivery-requests/:id` - Update request
- `DELETE /api/delivery-requests/:id` - Delete request

### Drivers (Admin Only)
- `POST /api/admin/drivers` - Create driver
- `GET /api/admin/drivers` - Get all drivers
- `GET /api/admin/drivers/active` - Get active drivers
- `GET /api/admin/drivers/:id` - Get driver by ID
- `PUT /api/admin/drivers/:id` - Update driver
- `PATCH /api/admin/drivers/:id/toggle-active` - Toggle driver status
- `DELETE /api/admin/drivers/:id` - Delete driver

### Contact Messages
- `POST /api/contact` - Submit contact message (public)
- `GET /api/admin/messages` - Get all messages
- `GET /api/admin/messages/unread` - Get unread messages
- `GET /api/admin/messages/:id` - Get message by ID
- `PATCH /api/admin/messages/:id/read` - Mark as read
- `DELETE /api/admin/messages/:id` - Delete message

## Frontend Changes

### API Client
The new API client is located at `src/integrations/api/client.ts`. It provides:
- `ApiClient` - Base HTTP client with token management
- `authApi` - Authentication endpoints
- `deliveryRequestApi` - Delivery request operations
- `driverApi` - Driver management
- `contactApi` - Contact messaging

### AuthContext
Updated to use Spring Boot authentication instead of Supabase:
- Stores JWT token in localStorage
- Automatically adds Authorization header to requests
- Manages user state independently

### Component Updates
The following components were updated to use the new API:
- `AuthContext.tsx`
- `DeliveryRequestForm.tsx`
- `DeliveryStatistics.tsx`
- `AdminDashboard.tsx`
- Other data-dependent components

## Environment Variables

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/euro_route_db
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update

jwt:
  secret: mySecretKeyForJWTTokenGenerationAndValidationPurposes123456789
  expiration: 86400000

server:
  port: 8080
```

### Frontend (.env or vite.config.ts)
```
VITE_API_URL=http://localhost:8080/api
```

## Security Considerations

1. **JWT Token**: The backend uses JWT for authentication
   - Default expiration: 24 hours
   - Configure the secret in `application.yml`

2. **CORS**: Configured for development
   - Allowed origins: `http://localhost:5173`, `http://localhost:3000`, `http://localhost:8080`
   - Configure in `SecurityConfig.java` for production

3. **Password Hashing**: Uses BCryptPasswordEncoder
   - All passwords are automatically hashed before storage

4. **Role-Based Access Control**: Three roles available
   - ADMIN: Full system access
   - STAFF: Can manage deliveries and drivers
   - DRIVER: Can only view their assigned deliveries

## Database Migrations

Flyway manages database migrations automatically. Migration files are located in:
```
Backend_Api/src/main/resources/db/migration/
```

New migrations should follow the naming convention: `V{version}__Description.sql`

Example:
- `V1__Create_Initial_Schema.sql` (already exists)
- `V2__Add_New_Column.sql` (new migration)

## Common Issues and Solutions

### Port Already in Use
If ports are already in use, update `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # PostgreSQL
  - "8081:8080"  # Backend
  - "5174:5173"  # Frontend
```

### Database Connection Errors
Check PostgreSQL is running:
```bash
docker ps | grep postgres
```

### API Not Responding
- Verify Spring Boot is running: `curl http://localhost:8080/api/delivery-requests`
- Check logs: `docker logs euro-route-backend`
- Verify CORS settings match your frontend URL

### Token Expiration
Tokens expire after 24 hours. Users need to sign in again. To adjust:
- Edit `jwt.expiration` in `application.yml` (milliseconds)
- Restart the application

## Building for Production

### Backend
```bash
cd Backend_Api
mvn clean package
```

This creates a fat JAR in `target/euro-route-backend-1.0.0.jar`

### Frontend
```bash
cd euro-route-flow
npm run build
```

This creates optimized build in `dist/`

### Docker Images
```bash
# Build and push to registry
docker build -t your-registry/euro-route-backend:1.0.0 ./Backend_Api
docker build -t your-registry/euro-route-frontend:1.0.0 ./euro-route-flow
docker push your-registry/euro-route-backend:1.0.0
docker push your-registry/euro-route-frontend:1.0.0
```

## Next Steps

1. **Update JWT Secret** (Important for Production!)
   - Generate a strong secret key
   - Update `jwt.secret` in `application.yml`

2. **Configure Database Credentials**
   - Update PostgreSQL username and password in `application.yml`
   - Update in `docker-compose.yml` environment variables

3. **Setup Email Notifications**
   - Add Spring Mail dependency to `pom.xml`
   - Create email service
   - Integrate with delivery status updates

4. **Add Logging and Monitoring**
   - Configure SLF4J/Logback
   - Add metrics with Micrometer
   - Setup centralized logging

5. **Performance Optimization**
   - Add caching (Redis)
   - Optimize database queries
   - Add database connection pooling

## Support

For issues or questions:
1. Check the logs: `docker-compose logs backend`
2. Verify database: `docker exec euro-route-postgres psql -U postgres -d euro_route_db -c "\dt"`
3. Test API endpoints with Postman or curl
