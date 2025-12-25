export const environment = {
	production: true,

	// Event Manager Service (Production)
	eventManagerServiceUrl: "/api",

	// User Service (Production)
	userServiceUrl: "/api",

	// Guest Service (Production)
	guestServiceUrl: "/api",

	// Notification Service (Production)
	notificationServiceUrl: "/api",
	notificationWebSocketUrl: "wss://your-domain.com/ws/notifications",
	enableWebSocketNotifications: true,

	// Keycloak Configuration (Production)
	keycloakUrl: "https://ip.com",
	keycloakRealm: "planify",
	keycloakClientId: "planify-frontend",

	// App Info
	appName: "Planify",
	version: "1.0.0",
};
