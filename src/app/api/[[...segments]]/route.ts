import type { NextRequest } from "next/server";
import { dispatchApi } from "@/lib/api-dispatch";

type Context = { params: Promise<{ segments?: string[] }> };

async function handle(request: NextRequest, context: Context): Promise<Response> {
  const { segments = [] } = await context.params;
  return dispatchApi(request, segments);
}

// Um único catch-all substitui as rotas antigas de /api/* para reduzir o
// número de Vercel Functions no free tier. As URLs públicas não mudaram.
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
