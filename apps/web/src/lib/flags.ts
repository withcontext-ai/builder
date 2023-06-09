export const flags = {
  isPro: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
  enabledAuth:
    process.env.IS_DOCKER ||
    [
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      process.env.CLERK_SECRET_KEY,
    ].every((env) => env != undefined && env !== ''),
  isNeon: process.env.DATABASE_URL?.includes('neon.tech') || false,
}
