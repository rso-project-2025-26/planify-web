export const environment = {
	production: false,
	eventManagerServiceUrl: "/api",
	bookingServiceUrl: "/api/booking",
	userServiceUrl: "/api",
	guestServiceUrl: "/api",
	notificationServiceUrl: "/api",
	notificationWebSocketUrl: "wss://4.185.235.181.nip.io/ws/notifications",
	enableWebSocketNotifications: true,

	keycloakUrl: "https://4.185.235.181.nip.io/keycloak",
	keycloakRealm: "planify",
	keycloakClientId: "planify-frontend",

	appName: "Planify",
	version: "1.0.0-dev",
};