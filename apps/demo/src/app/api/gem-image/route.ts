import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const seed = formData.get("seed") as string | null;

  if (!file || !seed) {
    return Response.json({ error: "Missing file or seed" }, { status: 400 });
  }

  const blob = await put(`gems/${encodeURIComponent(seed)}.png`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return Response.json({ url: blob.url });
}
