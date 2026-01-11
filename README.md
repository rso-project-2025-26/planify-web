# Planify Web

Frontend web application for the Planify event management platform. Built with Angular 17, Angular Material, and Keycloak authentication, providing a modern and responsive user interface for managing events, organizations, and guest invitations.

## Features

### Event Management
- **Public Events** - Browse and view public events without authentication
- **Event Creation** - Create and configure new events with location booking
- **Event Details** - View comprehensive event information including guest lists and RSVP statuses
- **Event Editing** - Update event details, dates, and locations
- **Status Management** - Publish, cancel, or complete events

### Organization Management
- **Organization Dashboard** - View and manage organization details
- **Member Management** - Invite, remove, and assign roles to organization members
- **Role-based Access** - Different permissions for guests, organizers, and admins
- **Join Requests** - Handle user requests to join organizations

### Guest & RSVP Management
- **Invitation System** - Send and manage event invitations
- **RSVP Responses** - Accept, decline, or maybe responses with real-time updates
- **Guest List View** - Track invitation status and attendance

### Notifications
- **In-App Notifications** - Real-time notifications for invitations and updates
- **WebSocket Support** - Live notification updates via WebSocket connection
- **Notification Center** - View all notifications in dedicated inbox

### Authentication & Security
- **Keycloak Integration** - OAuth2/OIDC authentication
- **Token-based Auth** - Secure JWT token handling
- **Protected Routes** - Role-based route guards
- **Auto Token Refresh** - Automatic refresh token management

## Technologies

### Frontend Framework
- **Angular 17** - Modern web application framework
- **TypeScript 5.2** - Type-safe programming language
- **RxJS 7.8** - Reactive programming library
- **Angular Router** - Client-side routing

### UI Components & Styling
- **Angular Material 17** - Material Design components
- **SCSS** - Enhanced CSS with variables and mixins
- **Responsive Design** - Mobile-first responsive layouts

### Authentication
- **angular-auth-oidc-client 17** - OpenID Connect authentication
- **keycloak-js 23** - Keycloak JavaScript adapter

### Development Tools
- **Angular CLI 17** - Command-line interface for Angular
- **TypeScript Compiler** - Type checking and compilation
- **Webpack** - Module bundling (via Angular CLI)

### Deployment
- **Nginx** - Production web server
- **Docker** - Containerization
- **Kubernetes/Helm** - Orchestration

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git**

For development, you'll also need:
- Running Planify backend services (see infrastructure setup)
- Keycloak instance configured with `planify` realm

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/rso-project-2025-26/planify-web.git
cd planify-web
```

### Install Dependencies

```bash
npm install
```

### Infrastructure Setup

This application requires the following backend services to be running:

- **user-service** (port 8082) - User and organization management
- **event-manager-service** (port 8081) - Event management
- **guest-service** (port 8085) - Guest invitations and RSVP
- **booking-service** (port 8086) - Location reservations
- **notification-service** (port 8083) - Notifications and WebSocket
- **Keycloak** (port 9080) - Authentication server

Refer to the main Planify infrastructure repository for setting up backend services:
```bash
git clone https://github.com/rso-project-2025-26/planify.git
cd planify
# Follow infrastructure README for setup
```

## Configuration

### Environment Files

The application uses environment-specific configuration files:

**Localhost** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  eventManagerServiceUrl: "/api",
  bookingServiceUrl: "/api/booking",
  userServiceUrl: "/api",
  guestServiceUrl: "/api",
  notificationServiceUrl: "/api",
  notificationWebSocketUrl: "ws://localhost:8083/ws/notifications",
  enableWebSocketNotifications: false,
  keycloakUrl: "http://localhost:9080",
  keycloakRealm: "planify",
  keycloakClientId: "planify-frontend",
  appName: "Planify",
  version: "1.0.0"
};
```

**Development** (`src/environments/environment.dev.ts`):
- Update service URLs to development endpoints
- Configure production Keycloak URL

**Production** (`src/environments/environment.prod.ts`):
- Set `production: true`
- Update service URLs to production endpoints
- Configure production Keycloak URL

### Proxy Configuration

For local development, API calls are proxied to backend services via `proxy.conf.json`:

```json
{
  "/api/events": { "target": "http://localhost:8081" },
  "/api/guests": { "target": "http://localhost:8085" },
  "/api/auth": { "target": "http://localhost:8082" },
  "/api/users": { "target": "http://localhost:8082" },
  "/api/organizations": { "target": "http://localhost:8082" },
  "/api/invitations": { "target": "http://localhost:8082" },
  "/api/notifications": { "target": "http://localhost:8083" },
  "/api/booking": { "target": "http://localhost:8086" },
  "/api/locations": { "target": "http://localhost:8086" }
}
```

This allows the frontend to make API calls to `/api/*` which are automatically routed to the appropriate backend service.

### Keycloak Configuration

Keycloak must be configured with:
- **Realm**: `planify`
- **Client ID**: `planify-frontend`
- **Client Type**: Public
- **Valid Redirect URIs**: `http://localhost:4200/*`, `https://[IP]/*`
- **Web Origins**: `http://localhost:4200`, `https://<[IP]`

Keycloak configuration is defined in `src/app/core/config/keycloak.config.ts`.

## Development

### Start Development Server

```bash
npm start
```

This will:
- Start the Angular development server on `http://localhost:4200`
- Enable proxy configuration for API calls
- Watch for file changes and auto-reload

Navigate to `http://localhost:4200` in your browser.

### Available Scripts

```bash
# Start development server with proxy
npm start

# Build for development
npm run build

# Build for production
npm run build:prod

# Run tests
npm test

# Lint code
npm run lint

# Watch mode (rebuild on changes)
npm run watch
```

### Project Structure

```
planify-web/
├── src/
│   ├── app/
│   │   ├── auth/                 # Keycloak (authentication) 
│   │   ├── core/                 # Core module (singleton services, guards, interceptors)
│   │   │   ├── models/           # Shared data models
│   │   │   └── services/         # Core services (API, auth)
│   │   ├── features/             # Feature modules (lazy loaded)
│   │   │   ├── auth/             # Authentication (login, register)
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── events/           # Event management
│   │   │   └── organizations/    # Organization management
│   │   ├── shared/               # Shared module (components, directives, pipes)
│   │   │   ├── components/       # Reusable components
│   │   │   └── services/         # Shared services
│   │   ├── app.component.*       # Root component
│   │   ├── app.module.ts         # Root module
│   │   └── app-routing.module.ts # Root routing
│   ├── environments/             # Environment configurations
│   ├── styles.scss               # Global styles
│   └── index.html                # HTML entry point
├── proxy.conf.json               # Development proxy configuration
├── nginx.conf                    # Production nginx configuration
├── angular.json                  # Angular CLI configuration
├── package.json                  # npm dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── Dockerfile                    # Docker build configuration
```

### Code Organization

**Core Module** (`src/app/core/`):
- Services instantiated once (singleton)
- Authentication and authorization logic
- HTTP interceptors for token injection
- Route guards for protected routes

**Feature Modules** (`src/app/features/`):
- Lazy-loaded for better performance
- Self-contained with routing, components, and services
- Examples: `events`, `organizations`, `auth`, `dashboard`

**Shared Module** (`src/app/shared/`):
- Reusable components (dialogs, loading spinners)
- Common directives and pipes
- Imported by feature modules as needed

## Building

### Development Build

```bash
npm run build
```

Output: `dist/planify-web/`
- Source maps enabled
- No optimization
- Suitable for debugging

### Production Build

```bash
npm run build:prod
```

Output: `dist/planify-web/`
- Minified and optimized
- AOT compilation
- Tree shaking
- Hash-based cache busting
- Bundle size limits enforced

**Build Configuration:**
- Initial bundle: max 1MB (error), 500KB (warning)
- Component styles: max 12KB (error), 8KB (warning)

## Deployment

### Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/planify-web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
# Build Docker image
docker build -t planify-web:latest .

# Run container
docker run -p 80:80 planify-web:latest
```

### Kubernetes/Helm Deployment

The application includes Helm charts for Kubernetes deployment:

```bash
# Install with Helm
helm install planify-frontend ./helm/web

# Upgrade deployment
helm upgrade planify-frontend ./helm/web

# Uninstall
helm uninstall planify-frontend
```

**Helm Configuration** (`helm/web/values.yaml`):
```yaml
replicaCount: 2
image:
  repository: ghcr.io/rso-project-2025-26/planify-web
  tag: main
  pullPolicy: Always
service:
  type: ClusterIP
  port: 80
ingress:
  enabled: true
  hosts:
    - host: planify.example.com
      paths: ["/"]
```

### Nginx Configuration

The production build uses Nginx for:
- Serving static files
- Handling Angular routing (fallback to index.html)
- Gzip compression
- Cache control headers
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Health check endpoint at `/health`

## API Integration

### Service Layer

The application uses Angular services to communicate with backend APIs:

**API Service** (`src/app/core/services/api.service.ts`):
- Base HTTP client wrapper
- Handles common request/response logic
- Automatic error handling

**Feature Services**:
- `EventService` - Event management APIs
- `GuestService` - Guest and RSVP APIs
- `OrganizationService` - Organization APIs
- `NotificationService` - Notification APIs
- `BookingService` - Location booking APIs

**Example Usage:**
```typescript
// Get all events for an organization
this.eventService.getEventsByOrganization(orgId).subscribe({
  next: (events) => console.log(events),
  error: (err) => console.error(err)
});
```

### HTTP Interceptor

**Token Interceptor** (`src/app/core/interceptors/token.interceptor.ts`):
- Automatically injects JWT Bearer token into all HTTP requests
- Handles token refresh on expiration
- Redirects to login on authentication errors

## Authentication

### Keycloak Integration

The application uses Keycloak for authentication via OpenID Connect:

**Login Flow:**
1. User accesses protected route
2. Auth guard checks for valid token
3. Redirects to Keycloak login if unauthenticated
4. Keycloak redirects back with authorization code
5. Application exchanges code for access token
6. Token stored and used for API calls

**Auth Service** (`src/app/core/services/auth.service.ts`):
```typescript
// Login
this.authService.login();

// Logout
this.authService.logout();

// Check authentication status
this.authService.isAuthenticated$().subscribe(isAuth => {
  console.log('Authenticated:', isAuth);
});

// Get user profile
this.authService.getUserProfile().subscribe(profile => {
  console.log('User:', profile);
});
```

### Protected Routes

**Auth Guard** (`src/app/core/guards/auth.guard.ts`):
- Protects routes requiring authentication
- Automatically redirects to login
- Preserves intended destination URL

**Usage:**
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

### Token Management

- **Access Token**: Short-lived (5-15 minutes), used for API calls
- **Refresh Token**: Long-lived, used to obtain new access tokens
- **Silent Refresh**: Automatic token refresh before expiration
- **Token Storage**: Secure storage in session/local storage

## WebSocket Notifications

### Real-time Notifications

The application supports real-time notifications via WebSocket:

**Configuration:**
```typescript
notificationWebSocketUrl: "ws://localhost:8083/ws/notifications"
enableWebSocketNotifications: true  // Enable in production
```

**WebSocket Service** (`src/app/core/services/websocket-notification.service.ts`):
- Establishes WebSocket connection on login
- Receives real-time notification updates
- Automatically reconnects on disconnect
- Closes connection on logout

**Features:**
- New invitation notifications
- RSVP response notifications
- Event update notifications
- Unread count updates

## Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure backend services allow requests from `http://localhost:4200`
- Check that proxy configuration is correct in `proxy.conf.json`

**Keycloak Authentication Fails:**
- Verify Keycloak is running on configured port (9080)
- Check that `planify-frontend` client exists in Keycloak
- Ensure redirect URIs are correctly configured
- Clear browser cache and cookies

**API Calls Fail:**
- Verify all backend services are running
- Check proxy configuration maps to correct ports
- Inspect browser Network tab for actual error messages
- Ensure JWT token is being sent in Authorization header

**Build Errors:**
- Run `npm ci` to ensure clean dependency installation
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version matches requirements (18.x)

## Contributing

### Code Style

- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Write meaningful component and service names
- Add comments for complex logic

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment:

**Workflow** (`.github/workflows/web-ci-cd.yaml`):
1. **Build & Test** - Install dependencies, build application
2. **Build Docker Image** - Create Docker image, push to GitHub Container Registry
3. **Deploy to Kubernetes** - Deploy via Helm to development or production namespace

**Branches:**
- `main` - Production deployments
- `dev` - Development deployments

**Registry:**
- Images pushed to: `ghcr.io/rso-project-2025-26/planify-web`

## License

This project is part of the RSO (Razvoj na osnovi storitev) course at University of Ljubljana.

## Links

- **Infrastructure Repository**: https://github.com/rso-project-2025-26/planify
- **Backend Services**: See infrastructure repository for individual service links
- **GitHub Container Registry**: https://github.com/rso-project-2025-26/planify-web/pkgs/container/planify-web