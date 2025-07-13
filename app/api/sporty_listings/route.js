import axios from "axios";

import { NextResponse } from "next/server";
import espn_all_teams from "@/public/json/espn_all_teams";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

// ... imports unchanged ...
export async function GET() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - FIVE_HOURS_MS);

  const { data: cached, error: fetchError } = await supabase
    .from("z_site_sporty_fixtures")
    .select("*")
    .gte("scraped_at", cutoff.toISOString());

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

  const baseUrl =
    "https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents";
  const headers = {
    // ... headers same as before ...
  };

  let pageNum = 1;
  const maxPages = 100;
  const allEvents = [];

  try {
    while (pageNum <= maxPages) {
      console.log(`Fetching page ${pageNum}...`);

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
            sporty_match_id: event.eventId,
            status: event.matchStatus,
            markets: event.markets,
            scraped_at: now.toISOString(),
          };
          allEvents.push(record);

          //  upsert events to Supabase
          const { error: insertError, data: inserted } = await supabase
            .from("z_site_sporty_fixtures")
            .upsert(record, {
              onConflict: "sporty_match_id",
            });

          if (insertError) {
            console.error("❌ Upsert failed:", insertError.message);
            return NextResponse.json(
              { success: false, error: insertError.message },
              { status: 500 }
            );
          }

          console.log(`✅ Inserted/updated ${inserted?.length || 0} events`);
        }
      }

      pageNum++;
    }

    return NextResponse.json({
      success: true,
      totalPages: pageNum - 1,
      inserted: inserted?.length || allEvents.length,
    });
  } catch (error) {
    console.error("❌ Fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Fetch or processing error" },
      { status: 500 }
    );
  }
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
