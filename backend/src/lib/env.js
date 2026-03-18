import "dotenv/config";
import { cleanEnv, str, port, url } from "envalid";

export const ENV = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  NODE_ENV: str({ choices: ["development", "test", "production"] }),
  CLIENT_URL: url(),
  RESEND_API_KEY: str(),
  EMAIL_FROM: str(),
  EMAIL_FROM_NAME: str(),
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),
  ARCJET_KEY: str(),
  ARCJET_ENV: str({ choices: ["development", "test", "production"] }),
  MESSAGE_ENCRYPTION_KEY: str(),
});
