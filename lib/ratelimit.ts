import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv()

const chatRatelimit = new Ratelimit({
    redis,
    limiter:Ratelimit.slidingWindow(20,'1 m'),
    analytics:true,
    prefix: 'ratelimit:chat',
})

export async function checkChatRateLimit(key: string){
    const { success, limit, remaining, reset } = await chatRatelimit.limit(key);
  return { success, limit, remaining, reset };
}