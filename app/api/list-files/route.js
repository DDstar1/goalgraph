import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function GET() {
  try {
    const { data: files, error } = await supabase.storage
      .from("executables")
      .list("", { limit: 100 });

    console.log("📦 List result:", files, error);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const signedFiles = [];

    for (const file of files || []) {
      const { data: signed, error: urlError } = await supabase.storage
        .from("executables")
        .createSignedUrl(file.name, 3600); // 1 hour

      if (urlError) {
        console.error(
          `❌ Signed URL error for ${file.name}:`,
          urlError.message
        );
        continue;
      }

      signedFiles.push({
        name: file.name,
        url: signed?.signedUrl,
        uploaded_at: file.created_at ?? null, // Use created_at from Supabase
      });
    }

    return NextResponse.json({ files: signedFiles });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
