# Quick Reference: Spring Backend API Integration

## How to Use the Application

### 1. **Frontend Access**
- **URL**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin (Login required)
- **Driver Dashboard**: http://localhost:3000/driver/dashboard (Driver login required)

### 2. **Backend API**
- **Base URL**: http://localhost:8081/api
- **All requests require Bearer token** from `/auth/signin`

### 3. **User Roles**
- **ADMIN**: Full access to all features, admin dashboard
- **STAFF**: Can view and manage deliveries
- **DRIVER**: Can view assigned deliveries, update status

## Common API Flows

### User Authentication Flow
```
1. POST /api/auth/signup → Get JWT token
2. Store token in localStorage as 'authToken'
3. All subsequent requests include: Authorization: Bearer <token>
4. User role stored in localStorage as 'currentUser'
```

### Submitting Contact Message
```
1. User fills contact form on /contact page
2. POST /api/contact with { name, email, phone, subject, message }
3. Message stored in database
4. Admin can view and respond in Dashboard → Messages tab
```

### Driver Viewing Deliveries
```
1. Driver logs in with their email/password
2. GET /api/admin/drivers → finds driver by userId
3. GET /api/delivery-requests/driver/{driverId} → gets assigned deliveries
4. Driver can update status: PUT /api/delivery-requests/{id}
```

### Admin Managing Drivers
```
1. Admin logs in
2. GET /api/admin/drivers → view all drivers
3. POST /api/admin/drivers → create new driver
4. PUT /api/admin/drivers/{id} → edit driver
5. DELETE /api/admin/drivers/{id} → remove driver
6. PATCH /api/admin/drivers/{id}/toggle-active → toggle active status
```

## Data Models

### DeliveryRequest
```typescript
{
  id: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemType: string;
  itemWeight: string | null;
  itemSize: string | null;
  requestedDate: string;
  requestedTime: string | null;
  status: "EN_ATTENTE" | "EN_COURS" | "LIVRE";
  clientNotes: string | null;
  internalNotes: string | null;
  trackingNumber: string | null;
  createdAt: string;
  assignedDriverId: string | null;
  completedAt: string | null;
}
```

### Driver
```typescript
{
  id: string;
  userId: string;
  fullName: string;
  email: string | null;
  phone: string;
  isActive: boolean;
  createdAt: string;
}
```

### ContactMessage
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "responded" | "deleted";
  responseText: string | null;
  responseDate: string | null;
  createdAt: string;
}
```

## Important Notes

### Status Values
- Always use **UPPERCASE** for status: `EN_ATTENTE`, `EN_COURS`, `LIVRE`
- Frontend StatusBadge will handle display formatting

### Field Names
- Frontend interfaces use **camelCase**
- Match backend DTOs exactly: `clientName` not `client_name`

### Authentication
- JWT tokens expire after 24 hours
- Store token in localStorage as `authToken`
- Include in all API requests: `Authorization: Bearer <token>`

### Error Handling
- All API errors include a `message` field
- Check HTTP status codes: 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)

## Docker Services

### Running Services
```bash
docker-compose up -d --build    # Start all services
docker-compose down             # Stop all services
docker-compose logs -f backend  # View backend logs
docker-compose logs -f frontend # View frontend logs
```

### Database
- **Type**: PostgreSQL 16
- **Port**: 5432
- **Database**: euro_route_db
- **User**: postgres
- **Password**: postgres

### Services
| Service | Port | Internal Port |
|---------|------|---|
| Frontend | 3000 | 5173 |
| Backend | 8081 | 8080 |
| PostgreSQL | 5432 | 5432 |

## Troubleshooting

### Issue: "Cannot read properties of undefined"
- Check field names match camelCase in interfaces
- Verify status values are uppercase (EN_ATTENTE not en_attente)

### Issue: 401 Unauthorized
- Token missing or expired
- Check localStorage has `authToken`
- Re-login to get new token

### Issue: CORS errors
- Backend port should be 8081
- Frontend port should be 3000 or 5173
- Check CORS config in Spring backend

### Issue: Database connection error
- PostgreSQL container must be running
- Check docker-compose.yml for correct credentials
- Run: `docker-compose logs postgres`

## Development Tips

### Adding New API Endpoint
1. Create controller in Spring backend
2. Add method to API client in `src/integrations/api/client.ts`
3. Use in component: `const data = await yourApi.method()`

### Testing API Directly
```bash
# Using curl
curl -H "Authorization: Bearer <token>" \
  http://localhost:8081/api/admin/drivers

# Using Postman
# Set header: Authorization: Bearer <token>
# GET http://localhost:8081/api/admin/drivers
```

### Debugging Frontend
- Open DevTools (F12)
- Network tab shows all API requests
- Verify requests go to `localhost:8081/api/...`
- Check response status and body

## Git Commands

```bash
# Check current branch
git branch

# View recent changes
git log --oneline -n 10

# Stash changes (if needed)
git stash

# Pull latest
git pull origin main
```

## Support & Documentation

- **Spring Boot API Docs**: Check backend README
- **React Component Docs**: Check individual .tsx files
- **Database Schema**: Check Flyway migrations in `Backend_Api/src/main/resources/db/migration/`
