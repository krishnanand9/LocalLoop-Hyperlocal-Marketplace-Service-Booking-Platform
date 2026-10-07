import 'dotenv/config';
const need = (k: string) => { const v = process.env[k]; if (!v) throw new Error(`Missing env var ${k}`); return v; };
export const env = {
  port: Number(process.env.PORT || 5000),
  mongo: need('MONGODB_URI'),
  jwtSecret: need('JWT_SECRET'),
  jwtExpires: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
