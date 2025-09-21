// app/api/example/route.js
import { supabase } from "@/utils/supabaseServerClient";
import { findTeamIdByName } from "@/utils/supabase_utils";
import slugify from "slugify";

export async function POST(req) {
  try {
    const { homeTeam, awayTeam } = await req.json();

    // Get team IDs
    const home_team_id = await findTeamIdByName(
      slugify(homeTeam, { lower: true })
    );
    const away_team_id = await findTeamIdByName(
      slugify(awayTeam, { lower: true })
    );

    // Fetch last 10 games for each team
    const { data: homeGames, error: homeError } = await supabase.rpc(
      "get_last_10_team_games",
      { team_id: home_team_id }
    );
    if (homeError) throw homeError;

    const { data: awayGames, error: awayError } = await supabase.rpc(
      "get_last_10_team_games",
      { team_id: away_team_id }
    );
    if (awayError) throw awayError;

    // ---------- Helper functions ----------
    const get1X2 = (homeGoals, awayGoals) => {
      if (homeGoals > awayGoals) return "1"; // Home win
      if (homeGoals < awayGoals) return "2"; // Away win
      return "X"; // Draw
    };

    const get2UP = (homeGoals, awayGoals) => {
      if (homeGoals - awayGoals >= 2) return "Home 2UP";
      if (awayGoals - homeGoals >= 2) return "Away 2UP";
      return "No 2UP";
    };

    const getDoubleChance = (homeGoals, awayGoals) => {
      if (homeGoals > awayGoals) return "1X"; // Home win or draw
      if (awayGoals > homeGoals) return "X2"; // Away win or draw
      return "12"; // Any win (no draw)
    };

    // ---------- Analyzer ----------
    const analyzeGames = (games) => {
      return games.map((game) => {
        const result_1X2 = get1X2(game.home_team_goals, game.away_team_goals);
        const result_2UP = get2UP(game.home_team_goals, game.away_team_goals);
        const double_chance = getDoubleChance(
          game.home_team_goals,
          game.away_team_goals
        );

        return {
          ...game,
          result_1X2,
          result_2UP,
          double_chance, // 👈 Added
        };
      });
    };

    const homeGamesAnalyzed = analyzeGames(homeGames);
    const awayGamesAnalyzed = analyzeGames(awayGames);

    return Response.json(
      {
        success: true,
        homeGames: homeGamesAnalyzed,
        awayGames: awayGamesAnalyzed,
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
