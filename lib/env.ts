type RuntimeEnvironment = Record<string, string | undefined>;

const readRequired = (
  name: string,
  environment: RuntimeEnvironment = process.env
) => {
  const value = environment[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const readUrl = (
  name: string,
  environment: RuntimeEnvironment = process.env,
  protocols: string[] = ["https:", "http:"]
) => {
  const value = readRequired(name, environment);

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL.`);
  }

  if (!protocols.includes(parsed.protocol)) {
    throw new Error(
      `Environment variable ${name} must use one of: ${protocols.join(", ")}.`
    );
  }

  return value.replace(/\/$/, "");
};

const readPrefixed = (
  name: string,
  prefixes: string[],
  environment: RuntimeEnvironment = process.env
) => {
  const value = readRequired(name, environment);

  if (!prefixes.some((prefix) => value.startsWith(prefix))) {
    throw new Error(
      `Environment variable ${name} does not have an expected prefix.`
    );
  }

  return value;
};

export const getDatabaseEnvironment = (
  environment: RuntimeEnvironment = process.env
) => ({
  databaseUrl: readUrl("DATABASE_URL", environment, [
    "postgresql:",
    "postgres:",
  ]),
});

export const getStripeEnvironment = (
  environment: RuntimeEnvironment = process.env
) => ({
  apiSecretKey: readPrefixed("STRIPE_API_SECRET_KEY", ["sk_"], environment),
  webhookSecret: readPrefixed("STRIPE_WEBHOOK_SECRET", ["whsec_"], environment),
});

export const getPublicAppEnvironment = (
  environment: RuntimeEnvironment = process.env
) => ({
  appUrl: readUrl("NEXT_PUBLIC_APP_URL", environment),
});

export const getClerkEnvironment = (
  environment: RuntimeEnvironment = process.env
) => ({
  publishableKey: readPrefixed(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    ["pk_"],
    environment
  ),
  secretKey: readPrefixed("CLERK_SECRET_KEY", ["sk_"], environment),
});

export const parseAdminIds = (value: string | undefined) =>
  value
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean) ?? [];

export const getAdminEnvironment = (
  environment: RuntimeEnvironment = process.env
) => ({
  adminIds: parseAdminIds(environment.CLERK_ADMIN_IDS),
});
