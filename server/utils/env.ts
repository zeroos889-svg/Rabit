/**
 * Environment Variables Validation and Protection
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod';

// Define environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),
  
  // JWT & Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // API Keys (optional but validated if present)
  DEEPSEEK_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server Configuration
  PORT: z.string().default('5000').transform(Number),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  
  // External Services (optional)
  SENTRY_DSN: z.string().url().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentValidator {
  private config: EnvConfig | null = null;
  private validated = false;

  /**
   * Validate environment variables on startup
   */
  validate(): EnvConfig {
    if (this.validated && this.config) {
      return this.config;
    }

    try {
      this.config = envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        REDIS_URL: process.env.REDIS_URL,
        SENTRY_DSN: process.env.SENTRY_DSN,
      });

      this.validated = true;
      return this.config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.errors.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
        
        console.error('❌ Environment Validation Failed:');
        console.error(missingVars);
        console.error('\n💡 Please check your .env file and ensure all required variables are set.');
        
        throw new Error('Environment validation failed. Check console for details.');
      }
      throw error;
    }
  }

  /**
   * Get validated environment variable
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    if (!this.validated || !this.config) {
      this.validate();
    }
    return this.config![key];
  }

  /**
   * Check if we're in production
   */
  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if we're in development
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Get database URL safely
   */
  getDatabaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  /**
   * Get JWT secret safely
   */
  getJwtSecret(): string {
    return this.get('JWT_SECRET');
  }
}

// Singleton instance
export const env = new EnvironmentValidator();

// Validate on import in production
if (process.env.NODE_ENV === 'production') {
  env.validate();
}

export default env;
