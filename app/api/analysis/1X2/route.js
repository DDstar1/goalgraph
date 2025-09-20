// app/api/example/route.js
import { supabase } from "@/utils/supabaseServerClient";
import { findTeamIdByName } from "@/utils/supabase_utils";
import slugify from "slugify";

export async function POST(req) {
  try {
    const { homeTeam, awayTeam, markets } = await req.json();

    const home_team_id = await findTeamIdByName(
      slugify(homeTeam, { lower: true })
    );
    const away_team_id = await findTeamIdByName(
      slugify(awayTeam, { lower: true })
    );

    //console.log("Team IDs:", home_team_id, away_team_id);

    // Fetch last 10 games for the home team
    const { data: homeGames, error: homeError } = await supabase.rpc(
      "get_last_10_team_games",
      { team_id: home_team_id }
    );
    if (homeError) throw homeError;

    // Fetch last 10 games for the away team
    const { data: awayGames, error: awayError } = await supabase.rpc(
      "get_last_10_team_games",
      { team_id: away_team_id }
    );
    if (awayError) throw awayError;

    //console.log("Home Games:", homeGames);
    //console.log("Away Games:", awayGames);

    return Response.json(
      {
        success: true,
        homeGames,
        awayGames,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ API Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
