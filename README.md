# 🚚 Euro Route Flow

### Delivery Management & Logistics Platform

Euro Route Flow is a **full-stack delivery management platform** designed to centralize delivery operations, driver management, delivery assignment, customer communication, and real-time operational monitoring.

The system provides a complete ecosystem composed of:

* 🌐 **Web application** for customers and administrators
* 📱 **Flutter mobile application** for drivers and administrators
* ⚙️ **Spring Boot REST API** backend
* 🗄️ **PostgreSQL** database
* 🐳 **Docker-based deployment**
* 🔐 **JWT authentication and role-based authorization**

The project was migrated from a Supabase-based architecture to a dedicated **Spring Boot + PostgreSQL backend**, providing greater control over business logic, security, data persistence, and future scalability.

---

# 🎯 Project Goal

Euro Route Flow aims to simplify and digitize delivery operations by connecting **customers, administrators, and drivers** through a unified platform.

The main objectives are:

* 📦 Create and manage delivery requests
* 🚛 Assign deliveries to available drivers
* 📍 Track delivery progress
* 🔄 Update delivery statuses
* 👨‍✈️ Manage drivers
* 👥 Manage users and roles
* 📊 Monitor delivery activity
* 💬 Facilitate communication between customers and the organization
* 📱 Provide drivers with a dedicated mobile application
* 🔐 Secure all sensitive operations

The functional specification describes the platform as a delivery-management solution focused on delivery requests, driver assignment, tracking, communication, user management, statistics, and security.

---

# 🏗️ System Architecture

```text
                         EURO ROUTE FLOW
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       🌐 Web Application  📱 Mobile App   👨‍💼 Admin
          React/TS          Flutter          Dashboard
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                     ⚙️ Spring Boot API
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        🔐 Security       🧠 Business Logic   📡 REST API
          JWT/RBAC
                               │
                               ▼
                       🗄️ PostgreSQL
                               │
                               ▼
                         🐳 Docker
```

The documented backend architecture follows a layered approach involving REST controllers, services, repositories, security components, JPA/database access, and PostgreSQL.

---

# ✨ Main Features

## 📦 Delivery Management

The platform allows delivery requests to be created and managed throughout their lifecycle.

### Delivery operations

* Create delivery requests
* View delivery requests
* Update delivery information
* Assign drivers
* Update delivery status
* Delete delivery requests
* View delivery history
* Track assigned deliveries

Example lifecycle:

```text
PENDING
   │
   ▼
ASSIGNED
   │
   ▼
IN_PROGRESS
   │
   ▼
COMPLETED
```

The backend exposes dedicated delivery-request operations and supports assigning a driver through the API.

---

# 👨‍✈️ Driver Management

Administrators can manage the driver fleet.

### Features

* Create drivers
* View all drivers
* View driver details
* Activate/deactivate drivers
* Associate drivers with user accounts
* View the authenticated driver's profile
* View deliveries assigned to a driver
* Monitor driver activity

The driver model is linked to the authentication system through a `user_id` relationship.

---

# 📱 Driver Mobile Application

The Flutter mobile application is designed specifically for drivers and provides a mobile interface for daily delivery operations.

### Driver features

* 🔐 Secure login
* 📦 View assigned deliveries
* 📍 View pickup and delivery locations
* 🔄 Track delivery status
* ☎️ Access customer contact information
* 📝 Add delivery notes
* 🔁 Synchronize with the backend

Supported delivery states include:

```text
Pending
   ↓
In Progress
   ↓
Completed
```

The mobile application also contains dedicated driver screens, controllers, services, models, and authentication components.

---

# 👨‍💼 Administration

The platform includes administrative functionality for managing the delivery ecosystem.

### Admin capabilities

* 📊 View delivery statistics
* 📦 View all deliveries
* 👨‍✈️ Manage drivers
* 🎯 Assign deliveries
* 👥 Manage users
* 📈 Monitor operational activity
* 💬 Manage contact messages
* ✉️ Respond to customer messages

The mobile application also contains an administration area with delivery statistics, driver management, assignment functionality, reporting, and user management.

---

# 💬 Customer Communication

Euro Route Flow includes a contact-message system.

Customers can submit:

* Email
* Phone
* Subject
* Message

Administrators can:

* View incoming messages
* Read customer requests
* Respond to messages
* Track message responses

The API includes dedicated endpoints for creating, retrieving, and responding to contact messages.

---

# 🔐 Security

Security is an important part of the architecture.

The backend implements:

* 🔑 JWT authentication
* 👥 Role-Based Access Control (RBAC)
* 🔒 BCrypt password hashing
* 🛡️ Spring Security
* 🔐 Protected REST endpoints
* ✅ Request validation
* 🌐 CORS configuration
* 🚫 Stateless authentication
* 🔒 Environment-based sensitive configuration

The project's security review documents JWT, BCrypt, RBAC, `@PreAuthorize`, CORS, stateless sessions, validation, and protection of sensitive configuration.

---

# 🗄️ Database

The project uses **PostgreSQL 16**.

The current documented schema contains four main tables:

```text
users
   │
   └── drivers

delivery_requests

contact_messages
```

### Main entities

#### Users

Responsible for:

* Authentication
* Email
* Password hash
* Role
* Account status
* Creation/update timestamps

#### Drivers

Contains:

* Driver identity
* User relationship
* Full name
* Phone number
* Active status
* Timestamps

#### Delivery Requests

Contains delivery-related information such as:

* Customer information
* Delivery details
* Status
* Assigned driver
* Addresses
* Timestamps

#### Contact Messages

Stores:

* Sender information
* Subject
* Message
* Administrative response
* Timestamps

The database uses Flyway migrations, including the initial schema, driver-user relationship, and contact-response changes.

---

# 🧩 Backend Architecture

The backend is implemented using **Spring Boot**.

```text
Backend_Api/
│
├── src/
│   └── main/
│
├── Dockerfile
├── pom.xml
├── settings.xml
└── PERFORMANCE_CONFIG.yml
```

The documented backend contains:

```text
Controllers
Services
Repositories
Entities
DTOs
Security
Database Migrations
```

Current project documentation reports:

* 5 controllers
* 7 services
* 4 repositories
* 4 entities
* 7 DTOs
* 4 security files
* 3 database migrations

---

# 🌐 Web Application

The web application is built using a modern React/TypeScript stack.

```text
euro-route-flow/
│
├── public/
├── src/
├── supabase/
├── Dockerfile
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

The project uses:

* ⚛️ React
* 📘 TypeScript
* ⚡ Vite
* 🎨 Tailwind CSS
* 🧭 React Router
* 🔄 TanStack Query
* 🧪 Vitest
* 🧩 Reusable components

The repository structure confirms the React/Vite/TypeScript setup and includes dedicated source, public, configuration, and testing files.

---

# 📱 Mobile Technology

The driver application is built with:

* 🐦 Flutter
* 🎯 Dart
* 📱 Android support
* 🍎 iOS-oriented cross-platform architecture
* 🔐 JWT authentication
* 🌐 REST API integration
* 🎨 Material Design
* 🌙 Dark theme support

The mobile project is structured around feature-based modules such as authentication, driver functionality, and administration.

---

# 🐳 Docker

The complete application can be started using Docker Compose.

The repository contains:

```text
docker-compose.yml
```

along with Dockerfiles for the backend and frontend components.

### Start the complete system

```bash
docker compose up -d --build
```

### Stop the system

```bash
docker compose down
```

### Stop and remove database volumes

⚠️ This removes persistent Docker volumes.

```bash
docker compose down -v
```

---

# ⚙️ Local Development

## Requirements

Before starting the project, install:

* Java 17+
* Maven
* Node.js
* npm
* PostgreSQL 16+
* Flutter SDK
* Docker & Docker Compose

---

# 🚀 Backend Setup

```bash
cd Backend_Api
```

Build:

```bash
mvn clean install
```

Run:

```bash
mvn spring-boot:run
```

The documented development configuration uses:

```text
Backend:
http://localhost:8081/api

PostgreSQL:
localhost:5432
```

---

# 🌐 Frontend Setup

```bash
cd euro-route-flow
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

The documented frontend development environment uses:

```text
http://localhost:3000
```

---

# 📱 Flutter Setup

```bash
cd euro-route-mobile
```

Install dependencies:

```bash
flutter pub get
```

Run:

```bash
flutter run
```

Build Android:

```bash
flutter build apk
```

---

# 🔌 REST API

The backend exposes REST endpoints grouped by functionality.

### Authentication

```text
POST /auth/signin
POST /auth/signup
...
```

### Deliveries

```text
GET    /delivery-requests
GET    /delivery-requests/{id}
POST   /delivery-requests
PUT    /delivery-requests/{id}
DELETE /delivery-requests/{id}
```

### Drivers

```text
GET /drivers
GET /drivers/me
GET /drivers/{id}/deliveries
```

### Contact

```text
POST /contact-messages
GET  /contact-messages
PUT  /contact-messages/{id}/respond
```

The project documentation provides the detailed API contract, including authenticated requests, driver operations, delivery management, and administrative message responses.

---

# 📊 Project Status

The repository includes a comprehensive project review documenting the state of the system.

At the time of that review:

```text
Backend              ✅ Operational
Frontend             ✅ Operational
PostgreSQL           ✅ Healthy
Docker               ✅ Configured
Authentication       ✅ Working
API Integration      ✅ Working
Database Migrations  ✅ Applied
Frontend Routes      ✅ Working
```

The review documented 24 unique API endpoints plus four derived/related endpoint counts, with the verification report listing 28 endpoint operations in total.

---

# 🧪 Testing & Verification

The project includes testing and verification documentation covering:

* Backend functionality
* Frontend rendering
* API connectivity
* Authentication
* Database migrations
* Docker services
* Security configuration
* Database persistence

The frontend project also includes Vitest configuration for automated testing.

---

# 📁 Repository Structure

```text
EURO-ROUTE-FLOW-PROJECT/
│
├── 📂 Backend_Api/
│   ├── src/
│   ├── Dockerfile
│   ├── pom.xml
│   └── PERFORMANCE_CONFIG.yml
│
├── 📂 euro-route-flow/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── 📂 euro-route-mobile/
│   ├── android/
│   ├── lib/
│   ├── pubspec.yaml
│   └── QUICK_START.md
│
├── 🐳 docker-compose.yml
│
├── 📋 CAHIER_DE_CHARGE.md
├── 📋 EXECUTIVE_SUMMARY.md
├── 📋 PROJECT_COMPLETION_SUMMARY.md
├── 📋 PROJECT_REVIEW_FIXES.md
├── 📋 QUICK_START.md
├── 📋 DEVELOPER_CHECKLIST.md
├── 📋 ENVIRONMENT_CONFIG.md
├── 📋 MIGRATION_GUIDE.md
├── 📋 DOCUMENTATION_INDEX.md
└── 📄 README.md
```

The repository contains separate frontend, backend, and mobile applications plus extensive technical and project documentation.

---

# 🔄 End-to-End Workflow

```text
                    CUSTOMER
                       │
                       ▼
              Create Delivery Request
                       │
                       ▼
                SPRING BOOT API
                       │
                       ▼
               ┌───────────────┐
               │  ADMIN PANEL  │
               └───────┬───────┘
                       │
                Assign Driver
                       │
                       ▼
                DRIVER MOBILE APP
                       │
                       ▼
                 Start Delivery
                       │
                       ▼
                 Update Status
                       │
                       ▼
              IN PROGRESS
                       │
                       ▼
                  COMPLETED
                       │
                       ▼
                System Updated
```

This architecture allows delivery operations to flow between the web interface, backend services, database, and driver mobile application.

---

# 🧠 Technical Highlights

This project demonstrates practical experience with:

### Backend

* Spring Boot
* REST API design
* Spring Security
* JWT
* JPA/Hibernate
* PostgreSQL
* Flyway migrations
* DTO architecture
* Service/Repository patterns
* Validation
* Role-based authorization

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* Component-based architecture
* API integration

### Mobile

* Flutter
* Dart
* Android
* Cross-platform architecture
* REST API integration
* Authentication
* Material Design

### DevOps

* Docker
* Docker Compose
* Containerized services
* Environment configuration
* Database migrations
* Multi-service application deployment

---

# 📈 Future Improvements

Possible future extensions include:

* 📍 Advanced GPS live tracking
* 🗺️ Interactive delivery maps
* 🧭 Route optimization
* 🔔 Push notifications
* 📧 Email notifications
* 💳 Online payment integration
* 📦 Proof-of-delivery management
* 📸 Delivery photo/signature confirmation
* 📊 Advanced logistics analytics
* 📈 Driver performance analytics
* 🔄 CI/CD automation
* 📡 Real-time WebSocket communication
* ☁️ Cloud deployment
* 📦 Redis caching
* 📊 Prometheus/Grafana monitoring
* 🚀 Horizontal scaling

---

# 👨‍💻 Author

## Wael Gabsi

Software Engineer focused on:

* Full-Stack Development
* Backend Engineering
* Enterprise Applications
* Mobile Development
* DevOps
* Cloud & Distributed Systems

---

# 📄 License

This project is currently provided for **educational, demonstration, and portfolio purposes**.

---

## ⭐ Project

If you find Euro Route Flow interesting, consider giving the repository a ⭐.

**Repository:**
https://github.com/GABSIWAEL/EURO-ROUTE-FLOW-PROJECT
