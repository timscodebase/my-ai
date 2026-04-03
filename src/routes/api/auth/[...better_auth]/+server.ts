import type { RequestEvent } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";

export async function GET({ request }: RequestEvent) {
  return auth.handler(request);
}

export async function POST({ request }: RequestEvent) {
  return auth.handler(request);
}
