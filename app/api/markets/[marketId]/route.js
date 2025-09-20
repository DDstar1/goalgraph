import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function GET(
  request,
  context // ✅ context.params is a Promise in Next.js 15
) {
  const { marketId } = await context.params; // ✅ Await before using

  console.log("marketId:", marketId);

  if (!marketId) {
    return NextResponse.json(
      { error: "Market ID is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("z_site_sporty_fixtures")
      .select("*")
      .eq("sporty_match_id", marketId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
