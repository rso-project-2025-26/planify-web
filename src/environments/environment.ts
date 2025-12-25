export const environment = {
	production: false,

	// Event Manager Service
	eventManagerServiceUrl: "/api",

	// Booking Service (REST for UI)
	bookingServiceUrl: "api/booking",

	// User Service
	userServiceUrl: "/api",

	// Guest Service
	guestServiceUrl: "/api",

	// Notification Service
	notificationServiceUrl: "/api",
	notificationWebSocketUrl: "ws://localhost:8083/ws/notifications",
	enableWebSocketNotifications: false, // Set to true when notification service is running

	// Keycloak Configuration
	keycloakUrl: "http://localhost:9080",
	keycloakRealm: "planify",
	keycloakClientId: "planify-frontend",

	// App Info
	appName: "Planify",
	version: "1.0.0",
};
