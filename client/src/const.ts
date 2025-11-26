export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

export const IS_TRIAL_MODE =
  (import.meta.env.VITE_TRIAL_MODE ?? "true").toString().toLowerCase() !==
  "false";

export const TRIAL_MESSAGE =
  import.meta.env.VITE_TRIAL_MESSAGE ??
  "بوابات الدفع متوقفة مؤقتاً خلال الفترة التجريبية ولن يتم خصم أي مبالغ.";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // If OAuth is not configured, return login page
  if (!oauthPortalUrl || !appId) {
    return "/login";
  }

  const origin =
    typeof globalThis !== "undefined" && globalThis.location
      ? globalThis.location.origin
      : "";
  const redirectUri = origin
    ? `${origin}/api/oauth/callback`
    : "/api/oauth/callback";
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("Failed to generate OAuth login URL:", error);
    return "/login";
  }
};
