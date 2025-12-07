# Planify Frontend

Modern, responsive frontend for the Planify event management system built with Angular 17.

## Overview

This is the frontend application for Planify, providing a user-friendly interface for event management including creating, organizing, and managing events from small meetings to large conferences.

## Features

- **Dashboard**: Overview of events, statistics, and upcoming activities
- **Event Management**: Create, edit, delete, and view events
- **Event Filtering**: Filter by type, date, location and search
- **Real-time Updates**: Integration with backend REST APIs
- **Loading States**: User-friendly loading and error handling

## Tech Stack

- **Framework**: Angular 17
- **Language**: TypeScript
- **Styling**: SCSS
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **State Management**: Service-based (RxJS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Edit `src/environments/environment.ts` to point to your backend:
   ```typescript
   export const environment = {
     production: false,
     eventManagerServiceUrl: 'http://localhost:8081'
   };
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Open browser**:
   Navigate to `http://localhost:4200`

## Development

### Development Server

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`. The app will automatically reload when you make changes to source files.

### Code Scaffolding

Generate new components:
```bash
ng generate component features/events/components/event-detail
ng generate service core/services/notification
ng generate module features/guests
```

### Linting

```bash
npm run lint
```

## Building

### Development Build

```bash
npm run build
```

### Production Build

```bash
npm run build:prod
```

The build artifacts will be stored in the `dist/` directory.

## Docker

### Build Docker Image

```bash
docker build -t planify-frontend:latest .
```

### Run Docker Container

```bash
docker run -p 4200:80 planify-frontend:latest
```

### Docker Compose (with backend)

From the project root:
```bash
cd infrastructure
docker-compose up
```

## API Integration

### Backend Configuration

The frontend expects the backend API to be running at the URL specified in the environment configuration.

**Development**: `http://localhost:8081`
**Production**: Update `src/environments/environment.prod.ts`

## Available Routes

- `/` - Redirects to events
- `/dashboard` - Dashboard with overview and statistics
- `/events` - List of all events with filters

## 🔗 Related Repositories

- Infrastructure Repository: [planify](https://github.com/rso-project-2025-26/planify)
- Event Manager Service Repository: [planify-event-manager-service](https://github.com/rso-project-2025-26/planify-event-manager-service)
