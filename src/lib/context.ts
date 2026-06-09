import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "./db";

export async function getContext() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  return { db, env };
}
