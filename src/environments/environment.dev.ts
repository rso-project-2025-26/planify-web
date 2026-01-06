export const environment = {
	production: false,

	// Event Manager Service
	eventManagerServiceUrl: "/api",

	// Booking Service
	bookingServiceUrl: "/api/booking",

	// User Service
	userServiceUrl: "/api",

	// Guest Service
	guestServiceUrl: "/api",

	// Notification Service
	notificationServiceUrl: "/api",
	notificationWebSocketUrl: "ws://131.189.20.56/ws/notifications",
	enableWebSocketNotifications: true,

	// Keycloak Configuration (via Ingress)
	keycloakUrl: "http://131.189.20.56/keycloak",
	keycloakRealm: "planify",
	keycloakClientId: "planify-frontend",

	// App Info
	appName: "Planify",
	version: "1.0.0-dev",
};