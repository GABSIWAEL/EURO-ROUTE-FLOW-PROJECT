# Quick Reference Guide

## Getting Started

### Start the Application
```bash
cd c:\Users\MSI\Desktop\rafik4\ with\ springbackend
docker compose up -d --build
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081/api
- **Database**: localhost:5432 (PostgreSQL)

### Stop the Application
```bash
docker compose down
```

### View Logs
```bash
# Backend logs
docker logs euro-route-backend -f

# Frontend logs
docker logs euro-route-frontend -f

# Database logs
docker logs euro-route-postgres -f
```

---

## Key Credentials

| Service | User | Password | Notes |
|---------|------|----------|-------|
| Database | postgres | postgres | PostgreSQL admin |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│        Frontend (React + Vite)                  │
│        Port: 3000                               │
│  - Authentication Pages                         │
│  - Delivery Request Form                        │
│  - Driver Dashboard                             │
│  - Admin Dashboard                              │
│  - Contact Management                           │
└────────────────┬────────────────────────────────┘
                 │ HTTP/REST
                 ↓
┌─────────────────────────────────────────────────┐
│     Backend (Spring Boot 3.2.0)                 │
│     Port: 8081                                  │
│  - REST API                                     │
│  - JWT Authentication                           │
│  - Business Logic                               │
│  - Flyway Migrations                            │
└────────────────┬────────────────────────────────┘
                 │ JDBC
                 ↓
┌─────────────────────────────────────────────────┐
│   Database (PostgreSQL 16-alpine)               │
│   Port: 5432                                    │
│  - Users                                        │
│  - Drivers                                      │
│  - Delivery Requests                            │
│  - Contact Messages                             │
└─────────────────────────────────────────────────┘
```

---

## File Structure

```
rafik4-with-springbackend/
├── Backend_Api/                          # Spring Boot Backend
│   ├── src/main/java/com/euroroute/
│   │   ├── controller/                   # REST Controllers
│   │   ├── service/                      # Business Logic
│   │   ├── entity/                       # JPA Entities
│   │   ├── dto/                          # Data Transfer Objects
│   │   ├── repository/                   # Data Access
│   │   └── security/                     # JWT & Security
│   ├── src/main/resources/
│   │   ├── application.yml               # Configuration
│   │   └── db/migration/                 # Flyway Migrations
│   └── pom.xml                           # Maven Dependencies
│
├── euro-route-flow/                      # React Frontend
│   ├── src/
│   │   ├── pages/                        # Route Pages
│   │   ├── components/                   # React Components
│   │   ├── contexts/                     # Auth Context
│   │   ├── integrations/api/             # API Client
│   │   └── App.tsx                       # Root Component
│   ├── package.json                      # NPM Dependencies
│   └── vite.config.ts                    # Vite Configuration
│
└── docker-compose.yml                    # Container Orchestration
```

---

## Common Development Tasks

### Add a New API Endpoint

1. **Create Entity** (if needed)
   ```java
   @Entity
   @Table(name = "table_name")
   @Data @Builder @NoArgsConstructor @AllArgsConstructor
   public class NewEntity {
       @Id @GeneratedValue(strategy = GenerationType.UUID)
       private String id;
       // fields with @Column annotations
   }
   ```

2. **Create DTO**
   ```java
   @Data @Builder @NoArgsConstructor @AllArgsConstructor
   public class NewEntityDTO {
       // same fields as entity
   }
   ```

3. **Create Repository**
   ```java
   @Repository
   public interface NewEntityRepository extends JpaRepository<NewEntity, String> {
       // custom query methods
   }
   ```

4. **Create Service**
   ```java
   @Service
   public class NewEntityService {
       @Autowired private NewEntityRepository repository;
       
       public NewEntityDTO create(NewEntityDTO dto) { }
       public NewEntityDTO getById(String id) { }
       public List<NewEntityDTO> getAll() { }
       public void delete(String id) { }
   }
   ```

5. **Create Controller**
   ```java
   @RestController
   @RequestMapping("/api/new-entity")
   @CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
   public class NewEntityController {
       @Autowired private NewEntityService service;
       
       @PostMapping
       public ResponseEntity<NewEntityDTO> create(@RequestBody NewEntityDTO dto) {
           return ResponseEntity.ok(service.create(dto));
       }
   }
   ```

### Add Database Migration

1. Create new file in `Backend_Api/src/main/resources/db/migration/`
2. Name format: `V<number>__Description.sql`
3. Example:
   ```sql
   -- V4__Add_New_Table.sql
   CREATE TABLE new_table (
       id VARCHAR(36) PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   CREATE INDEX idx_new_table_name ON new_table(name);
   ```

### Build and Deploy Changes

```bash
# From project root
cd Backend_Api
mvn clean package -DskipTests

# Or use Docker (from project root)
docker compose down -v
docker compose up -d --build
```

---

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker logs euro-route-backend

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker logs euro-route-postgres

# Reset database
docker compose down -v  # removes volumes!
docker compose up -d
```

### Frontend Not Loading
```bash
# Check frontend logs
docker logs euro-route-frontend

# Check if API connection works
curl http://localhost:8081/api
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml or stop conflicting service
netstat -ano | findstr :3000
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

---

## Performance Tips

1. **Database Queries**
   - Always create indexes for frequently queried columns
   - Use pagination for large result sets
   - Enable query logging for optimization

2. **API Responses**
   - Keep DTOs lightweight
   - Avoid N+1 query problems
   - Use caching for frequently accessed data

3. **Frontend**
   - Lazy load components
   - Optimize images
   - Use React.memo for expensive components

---

## Security Checklist

- [ ] Change JWT secret key in `application.yml`
- [ ] Set proper CORS origins for production
- [ ] Enable HTTPS
- [ ] Validate all user inputs
- [ ] Use environment variables for sensitive data
- [ ] Set up rate limiting
- [ ] Enable request logging for audit trail
- [ ] Configure firewall rules
- [ ] Use strong database passwords
- [ ] Implement backup strategy

---

## Testing

### Manual API Testing with cURL

```bash
# Signup
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","fullName":"Test User"}'

# Signin
curl -X POST http://localhost:8081/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'

# Create Delivery Request
curl -X POST http://localhost:8081/api/delivery-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientName":"John",
    "clientPhone":"1234567890",
    "clientEmail":"john@test.com",
    "pickupAddress":"123 Main St",
    "deliveryAddress":"456 Oak Ave",
    "itemType":"Package",
    "itemSize":"Medium",
    "itemWeight":"5kg",
    "requestedDate":"2026-02-15",
    "requestedTime":"14:00"
  }'
```

---

## Useful Commands

```bash
# View all containers
docker ps -a

# View specific container logs
docker logs <container-name> -f

# Access database
docker exec -it euro-route-postgres psql -U postgres -d euro_route_db

# Rebuild specific service
docker compose up -d --build backend

# Remove all unused Docker resources
docker system prune -a -v

# Check application config
docker exec euro-route-backend cat /app/application.yml
```

---

## Support & Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Docker Docs**: https://docs.docker.com
- **JWT Guide**: https://jwt.io/introduction

---

**Last Updated**: 2026-02-01
