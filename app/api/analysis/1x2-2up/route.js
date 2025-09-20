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

    //console.log("Team IDs:", home_team_id, away_team_id);

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

    // Helper functions
    const get1X2 = (homeGoals, awayGoals) => {
      if (homeGoals > awayGoals) return "1";
      if (homeGoals < awayGoals) return "2";
      return "X";
    };

    const get2UP = (homeGoals, awayGoals) => {
      if (homeGoals - awayGoals >= 2) return "Home 2UP";
      if (awayGoals - homeGoals >= 2) return "Away 2UP";
      return "No 2UP";
    };

    // Map results for 1X2 and 2UP with console logging
    const analyzeGames = (games) => {
      const results = games.map((game) => {
        const result_1X2 = get1X2(game.home_team_goals, game.away_team_goals);
        const result_2UP = get2UP(game.home_team_goals, game.away_team_goals);

        //console.log(
        //  `Game: ${game.home_team_name} vs ${game.away_team_name} | ` +
        //    `Score: ${game.home_team_goals}-${game.away_team_goals} | ` +
        //    `1X2: ${result_1X2} | 2UP: ${result_2UP}`
        //);

        return {
          ...game,
          result_1X2,
          result_2UP,
        };
      });

      // Summary of 2UP wins
      const summary = results.reduce(
        (acc, g) => {
          if (g.result_2UP === "Home 2UP") acc.home2UP++;
          else if (g.result_2UP === "Away 2UP") acc.away2UP++;
          return acc;
        },
        { home2UP: 0, away2UP: 0 }
      );

      //console.log("2UP Summary:", summary);
      return results;
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
