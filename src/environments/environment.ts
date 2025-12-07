export const environment = {
  production: false,
  
  // Event Manager Service
  eventManagerServiceUrl: 'http://localhost:8081/api',
  
  // User Service
  userServiceUrl: 'http://localhost:8082/api',
  
  // Keycloak Configuration
  keycloakUrl: 'http://localhost:9080',
  keycloakRealm: 'planify',
  keycloakClientId: 'planify-frontend',

  // App Info
  appName: 'Planify',
  version: '1.0.0'
};