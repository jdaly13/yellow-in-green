import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

const DEFAULT_REDIRECT = "/";

export const TOTAL_MAXIMUM_INCORRECT_ANSWERS = 30;
export const CAPTCHA_ID = "6LcOp0ApAAAAAD1_E5I-J1KHWuuT34NTLWirWeIq";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(to, defaultRedirect = DEFAULT_REDIRECT) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id) {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );

  return route?.data;
}

function isUser(user) {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser() {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email) {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function truncateAddress(address) {
  if (address) {
    return (
      address.substring(0, 5) + "..." + address.substring(address.length - 5)
    );
  }
}

export function checkAccount(address) {
  return address === process.env.ACCOUNT;
}
