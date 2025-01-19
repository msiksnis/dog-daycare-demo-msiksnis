/**
 * An array of routes that are public
 * These routes are accessible without authentication
 *
 */
export const publicRoutes = ["/auth/new-verification"];

/**
 * An array of routes that used for authentication
 * These routes will redirect logged in users to the DEFAULT_LOGIN_REDIRECT
 *
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset-password",
  "/auth/new-password",
];

/**
 * An array of routes that are allowed for users with the role "USER"
 */
export const ALLOWED_USER_ROUTES = ["/settings/profile", "/notifications"];

/**
 * The prefix for the API routes
 * Routes that start with this prefix are used for API authentication purposes
 *
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after login
 *
 */
export const DEFAULT_LOGIN_REDIRECT = "/";
