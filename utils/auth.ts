"use client";

/**
 * Checks if the user is authenticated by looking for the auth cookie
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") {
    return false; // Always return false on server-side
  }

  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  return cookies.some((cookie) => cookie.startsWith("auth="));
};

/**
 * Gets the user data from the auth cookie
 */
export const getAuthUser = () => {
  if (typeof window === "undefined") {
    return null; // Return null on server-side
  }

  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  const authCookie = cookies.find((cookie) => cookie.startsWith("auth="));

  if (!authCookie) {
    return null;
  }

  try {
    const encodedUserData = authCookie.substring(5); // Remove 'auth=' prefix
    const decodedUserData = atob(encodedUserData);
    return JSON.parse(decodedUserData);
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
};

/**
 * Logs out the user by removing the auth cookie and redirecting
 */
export const logout = () => {
  document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/login";
};
