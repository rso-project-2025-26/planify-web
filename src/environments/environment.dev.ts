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
	notificationWebSocketUrl: "ws://4.185.235.181/ws/notifications",
	enableWebSocketNotifications: true,

	// Keycloak Configuration (via Ingress)
	keycloakUrl: "https://4.185.235.181/keycloak",
	keycloakRealm: "planify",
	keycloakClientId: "planify-frontend",

	// App Info
	appName: "Planify",
	version: "1.0.0-dev",
};