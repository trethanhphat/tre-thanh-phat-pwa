// File: src/lib/server-env.ts

export const serverEnv = {
  WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY as string,
  WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET as string,
};

// ✅ Fail sớm – chỉ chạy ở server
if (!serverEnv.WC_CONSUMER_KEY || !serverEnv.WC_CONSUMER_SECRET) {
  throw new Error('❌ Thiếu WC_CONSUMER_KEY hoặc WC_CONSUMER_SECRET');
}
