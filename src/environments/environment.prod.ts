export const environment = {
	production: true,

	// Event Manager Service (Production)
	eventManagerServiceUrl: "/api",

	// Booking Service (Production)
	bookingServiceUrl: "/api/booking",

	// User Service (Production)
	userServiceUrl: "/api",

	// Guest Service (Production)
	guestServiceUrl: "/api",

	// Notification Service (Production)
	notificationServiceUrl: "/api",
	notificationWebSocketUrl: "wss://4.182.10.195:30083/ws/notifications",
	enableWebSocketNotifications: true,

	// Keycloak Configuration (Production)
	keycloakUrl: "https://4.182.10.195:30080",
	keycloakRealm: "planify",
	keycloakClientId: "planify-frontend",

	// App Info
	appName: "Planify",
	version: "1.0.0",
};
