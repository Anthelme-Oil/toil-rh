import "server-only";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(
      `[EMAIL_CONFIG] La variable d'environnement "${key}" est requise.`,
    );
  }

  return value.trim();
};

const getPort = (): number => {
  const value = getRequiredEnv("SMTP_PORT");
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `[EMAIL_CONFIG] SMTP_PORT doit être un port valide.`,
    );
  }

  return port;
};

const getBoolean = (key: string): boolean => {
  const value = getRequiredEnv(key).toLowerCase();

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(
    `[EMAIL_CONFIG] ${key} doit être "true" ou "false".`,
  );
};

export const getEmailConfig = () =>
  Object.freeze({
    smtp: {
      host: getRequiredEnv("SMTP_HOST"),
      port: getPort(),
      secure: getBoolean("SMTP_SECURE"),

      auth: {
        user: getRequiredEnv("SMTP_USER"),
        pass: getRequiredEnv("SMTP_PASS"),
      },

      requireTLS: true,
    },

    from: getRequiredEnv("MAIL_FROM"),
  });