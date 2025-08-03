import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Log: Initializing Supabase client
console.log("🔧 Initializing Supabase client...");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ Keep this on server only
);

export async function POST(req) {
  console.log("📩 Received POST request for signed upload URL");

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("❌ Failed to parse request JSON:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fileName, contentType } = body;

  // Log request parameters
  console.log("📁 File name:", fileName);
  console.log("🧾 Content-Type:", contentType);

  if (!fileName) {
    console.warn("⚠️ Missing fileName in request");
    return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
  }

  try {
    console.log("🔗 Requesting signed upload URL for:", fileName);

    const { data, error } = await supabase.storage
      .from("executables")
      .createSignedUploadUrl(fileName, 60); // root path

    if (error) {
      console.error(
        "❌ Error from Supabase when generating signed URL:",
        error
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Signed URL generated:", data?.signedUrl);

    return NextResponse.json({ url: data.signedUrl });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
