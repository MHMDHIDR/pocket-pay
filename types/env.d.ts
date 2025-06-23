declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
    }
  }
}

export {};