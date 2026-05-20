import { aiHealth } from "@/lib/ai";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const h = await aiHealth();
  return Response.json(h);
}
