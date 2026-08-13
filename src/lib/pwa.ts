/**
 * Guarded service-worker registration.
 * Never registers in dev, inside an iframe, or in Lovable preview hosts.
 */
const BLOCKED_SUFFIXES = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "beta.lovable.dev",
];

const isBlockedHost = (host: string) =>
  host.startsWith("id-preview--") ||
  host.startsWith("preview--") ||
  BLOCKED_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));

const inIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const unregisterAppWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? "").includes("/sw.js"))
      .map((r) => r.unregister()),
  );
};

export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return;

  const swOff = new URLSearchParams(window.location.search).get("sw") === "off";
  const refuse =
    !import.meta.env.PROD || inIframe() || isBlockedHost(window.location.hostname) || swOff;

  if (refuse) {
    await unregisterAppWorkers();
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    /* offline support is best-effort */
  }
};
