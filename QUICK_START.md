# Quick Start Guide

## Prerequisites
- Docker and Docker Compose installed
- Or Java 17, Maven 3.9+, Node.js 18+, PostgreSQL 16

## 🚀 Quick Start with Docker Compose

```bash
# Navigate to the project root
cd /path/to/rafik4\ with\ springbackend

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Database**: localhost:5432 (postgres / postgres)

### Stopping Services
```bash
docker-compose down
```

---

## 🔧 Local Development Setup

### 1. Start PostgreSQL
```bash
docker run -d \
  --name euro-route-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=euro_route_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Build and Start Backend
```bash
cd Backend_Api
mvn clean install
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

### 3. Start Frontend
```bash
cd euro-route-flow
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 📋 Default Test Credentials

The system comes with initial user setup. Use these for testing:

### Testing Authentication
1. Sign Up: Create a new account at `/admin`
2. Sign In: Use your credentials

---

## 🗄️ Database Management

### Access Database
```bash
docker exec -it euro-route-postgres psql -U postgres -d euro_route_db
```

### Useful SQL Commands
```sql
-- List all tables
\dt

-- Check users
SELECT id, email, role, is_active FROM users;

-- Check delivery requests
SELECT id, client_name, status, created_at FROM delivery_requests;

-- Check drivers
SELECT id, full_name, phone, is_active FROM drivers;
```

---

## 🔐 Authentication Flow

1. **Sign Up**: User creates account (defaults to DRIVER role)
2. **Sign In**: User logs in with email/password
3. **JWT Token**: Backend returns JWT token
4. **API Requests**: Token sent in Authorization header: `Bearer {token}`
5. **Token Storage**: Token stored in localStorage
6. **Auto-refresh**: Token included in all subsequent requests

---

## 📦 API Usage Examples

### Create Delivery Request
```bash
curl -X POST http://localhost:8080/api/delivery-requests \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "John Doe",
    "clientPhone": "+33612345678",
    "clientEmail": "john@example.com",
    "pickupAddress": "123 Rue de Paris",
    "deliveryAddress": "456 Avenue Lyon",
    "itemType": "documents",
    "requestedDate": "2026-02-15"
  }'
```

### Get All Deliveries
```bash
curl -X GET http://localhost:8080/api/delivery-requests \
  -H "Authorization: Bearer {your_jwt_token}"
```

### Update Delivery Status
```bash
curl -X PUT http://localhost:8080/api/delivery-requests/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -d '{
    "status": "EN_COURS",
    "assignedDriverId": "{driver_id}"
  }'
```

---

## 🐛 Troubleshooting

### Services not starting?
```bash
# Check Docker logs
docker-compose logs -f

# Rebuild everything
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection errors?
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs euro-route-postgres

# Verify connection
docker exec euro-route-postgres psql -U postgres -c "SELECT 1"
```

### Frontend can't reach backend?
1. Check backend is running: `curl http://localhost:8080`
2. Verify CORS settings in `Backend_Api/src/main/java/com/euroroute/security/SecurityConfig.java`
3. Check network: `docker network ls` and `docker network inspect euro-route-network`

### Authentication failing?
1. Check token in localStorage: Open DevTools → Application → Local Storage
2. Verify JWT secret matches between frontend and backend
3. Check token expiration: Tokens expire after 24 hours

---

## 📊 Key Features Implemented

✅ User authentication with JWT  
✅ Role-based access control (ADMIN, STAFF, DRIVER)  
✅ Delivery request management  
✅ Driver management  
✅ Contact message system  
✅ Delivery statistics and tracking  
✅ PostgreSQL database with migrations  
✅ Docker containerization  
✅ CORS configuration for frontend  
✅ RESTful API design  

---

## 🔄 Migration from Supabase

The following components have been migrated:
- **Auth**: From Supabase Auth → JWT + Spring Security
- **Database**: From Supabase PostgreSQL → Standalone PostgreSQL
- **API**: From Supabase client → Custom REST API
- **Frontend Integration**: All components updated to use new API client

See `MIGRATION_GUIDE.md` for detailed migration information.

---

## 📱 Testing the Application

### 1. Register a new driver
```
Navigate to: http://localhost:5173/admin
Fill in the registration form
You'll be assigned DRIVER role by default
```

### 2. Create a delivery request
```
Navigate to: http://localhost:5173/request
Fill in all required fields
Submit the form
Status: EN_ATTENTE by default
```

### 3. View dashboard (Admin/Staff only)
```
Need to sign in as ADMIN or STAFF
Navigate to: http://localhost:5173/dashboard
View all deliveries and statistics
Assign drivers to deliveries
Update delivery status
```

---

## 🛠️ Configuration Files

### Backend Configuration
- **File**: `Backend_Api/src/main/resources/application.yml`
- **Purpose**: Spring Boot configuration (database, JWT, logging)
- **Override**: Set environment variables or create `application-prod.yml`

### Frontend Configuration
- **File**: `euro-route-flow/.env` (create if needed)
- **Key**: `VITE_API_URL`
- **Example**: `VITE_API_URL=http://localhost:8080/api`

### Docker Configuration
- **File**: `docker-compose.yml`
- **Services**: PostgreSQL, Backend, Frontend
- **Ports**: 5432, 8080, 5173 (configurable)

---

## 📚 Documentation

- **API Specification**: See endpoint list in `MIGRATION_GUIDE.md`
- **Database Schema**: See schema section in `MIGRATION_GUIDE.md`
- **Architecture**: See architecture section in `MIGRATION_GUIDE.md`
- **Troubleshooting**: See troubleshooting section in `MIGRATION_GUIDE.md`

---

## 🎯 Next Steps

1. **Customize JWT Secret** (Production only)
2. **Setup email notifications** (optional)
3. **Configure payment integration** (if needed)
4. **Deploy to cloud** (AWS, GCP, Azure, etc.)
5. **Setup CI/CD pipeline** (GitHub Actions, GitLab CI, etc.)

---

## 📞 Support

For questions or issues:
1. Check the logs: `docker-compose logs -f`
2. Review the `MIGRATION_GUIDE.md`
3. Check API endpoints with Postman
4. Verify database schema: `\dt` in psql

Happy coding! 🚀
