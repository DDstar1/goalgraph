// @vercel/crons: 0 6 * * *  # every day at 06:00 UTC

import axios from "axios";
import { NextResponse } from "next/server";
import espn_all_teams from "@/public/json/espn_all_teams";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const BATCH_SIZE = 100; // Supabase handles 500 max, use 100 to be safe
const MAX_PAGES = 100;

export async function GET() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - FIVE_HOURS_MS);
  let allEvents = [];

  // Step 1: Use cache if recent data exists
  const { data: cached, error: fetchError } = await supabase
    .from("z_site_sporty_fixtures")
    .select("*")
    .gte("scraped_at", cutoff.toISOString())
    .limit(100);

  if (fetchError) {
    console.error("❌ Supabase fetch error:", fetchError.message);
  }

  if (cached && cached.length > 0) {
    return NextResponse.json({
      success: true,
      from: "cache",
      data: cached,
    });
  }

  // Step 2: Delete stale records
  const { error: deleteError } = await supabase
    .from("z_site_sporty_fixtures")
    .delete()
    .lt("scraped_at", cutoff.toISOString());

  if (deleteError) {
    console.error("❌ Failed to delete old records:", deleteError.message);
  } else {
    console.log("✅ Old records deleted successfully.");
  }

  const baseUrl =
    "https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents";
  const headers = {
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Accept-Language": "en",
    "Sec-Ch-Ua":
      '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    Clientid: "web",
    Operid: "2",
    "Sec-Ch-Ua-Mobile": "?0",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Platform: "web",
    Accept: "*/*",
    Referer: "https://www.sportybet.com/ng/sport/football",
    "Accept-Encoding": "gzip, deflate, br",
  };

  try {
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      console.log(`🔄 Fetching page ${pageNum}...`);

      const url = `${baseUrl}?sportId=sr%3Asport%3A1&marketId=1%2C18%2C10%2C29%2C11%2C26%2C36%2C14%2C60100&pageSize=100&pageNum=${pageNum}&option=1&_t=${Date.now()}`;
      const response = await axios.get(url, { headers });

      const tournaments = response.data?.data?.tournaments || [];
      if (tournaments.length === 0) break;

      for (const tournament of tournaments) {
        for (const event of tournament.events || []) {
          const record = {
            tournament_name: tournament.name,
            home_team: event.homeTeamName,
            home_team_logo: espnLookup(event.homeTeamName),
            away_team: event.awayTeamName,
            away_team_logo: espnLookup(event.awayTeamName),
            start_time: new Date(event.estimateStartTime).toISOString(),
            sporty_match_id: event.eventId.split(":").pop(),
            status: event.matchStatus,
            markets: event.markets,
            scraped_at: now.toISOString(),
          };

          allEvents.push(record);
        }
      }
    }

    // Step 3: Batch upsert all records
    const chunked = chunkArray(allEvents, BATCH_SIZE);

    for (const chunk of chunked) {
      const { error } = await supabase
        .from("z_site_sporty_fixtures")
        .upsert(chunk, { onConflict: "sporty_match_id" });

      if (error) {
        console.error("❌ Batch upsert failed:", error.message);
      } else {
        console.log(`✅ Upserted batch of ${chunk.length} records`);
      }
    }

    return NextResponse.json({
      success: true,
      totalInserted: allEvents.length,
      totalBatches: chunked.length,
    });
  } catch (error) {
    console.error("❌ Final fetch or processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper to chunk an array into pieces
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function espnLookup(teamName) {
  if (!teamName) return null;

  const name = teamName
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2)
    .join("-");

  const match = espn_all_teams.find((entry) =>
    entry.toLowerCase().includes(name)
  );

  if (!match)
    return "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default-team-logo-500.png";

  const [id] = match.split("/");
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
}
