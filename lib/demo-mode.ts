export const resolveDemoMode = (
  demoMode: string | undefined,
  clerkPublishableKey: string | undefined
) => demoMode === "true" || !clerkPublishableKey;

export const isDemoMode = () =>
  resolveDemoMode(
    process.env.NEXT_PUBLIC_DEMO_MODE,
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );
