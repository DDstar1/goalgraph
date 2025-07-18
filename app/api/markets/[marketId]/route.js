import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function GET(request, { params }) {
  const marketId = params.marketId;

  console.log("marketId:", marketId);

  if (!marketId) {
    return NextResponse.json(
      { error: "Market ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from("z_site_sporty_fixtures") // Replace with your actual table name
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
