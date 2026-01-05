export const environment = {
    production: true,
    eventManagerServiceUrl: "/api",
    bookingServiceUrl: "/api/booking",
    userServiceUrl: "/api",
    guestServiceUrl: "/api",
    notificationServiceUrl: "/api",
    notificationWebSocketUrl: "wss://PROD_IP.nip.io/ws/notifications",
    enableWebSocketNotifications: true,
    
    keycloakUrl: "http://PROD_IP.nip.io/keycloak",
    keycloakRealm: "planify",
    keycloakClientId: "planify-frontend",
    
    appName: "Planify",
    version: "1.0.0",
};