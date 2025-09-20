// app/api/example/route.js
import { supabase } from "@/utils/supabaseServerClient";
import { findTeamIdByName } from "@/utils/supabase_utils";
import slugify from "slugify";

export async function POST(req) {
  try {
    const { homeTeam, awayTeam, lines } = await req.json();

    // default lines if not provided
    const goalLines = Array.isArray(lines)
      ? lines.map(Number)
      : [0.5, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5];

    // Get team IDs
    const home_team_id = await findTeamIdByName(
      slugify(homeTeam || "", { lower: true })
    );
    const away_team_id = await findTeamIdByName(
      slugify(awayTeam || "", { lower: true })
    );

    // Fetch last 10 games for each team via Supabase RPC
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

    // Helper to evaluate a match against the provided lines
    const evaluateLines = (homeGoals, awayGoals) => {
      const total = Number(homeGoals) + Number(awayGoals);
      const map = {};
      const arr = [];

      goalLines.forEach((line) => {
        // Determine result; for whole lines like 2.0 exact => Void/Refund
        const isWhole = Number.isInteger(line);
        if (total > line) {
          map[line] = `Over ${line}`;
          arr.push({ line, result: `Over ${line}` });
        } else if (total < line) {
          map[line] = `Under ${line}`;
          arr.push({ line, result: `Under ${line}` });
        } else {
          // total === line
          map[line] = isWhole ? `Void/Refund` : `Under ${line}`;
          // Note: For half-lines exact equality cannot happen; but kept for clarity.
          arr.push({ line, result: isWhole ? `Void/Refund` : `Under ${line}` });
        }
      });

      return { total, over_under_map: map, over_under_array: arr };
    };

    // Enhance games but keep original supabase fields (game_date, home_team_name, etc.)
    const analyzeGames = (games) =>
      (games || []).map((game) => {
        const { total, over_under_map, over_under_array } = evaluateLines(
          game.home_team_goals,
          game.away_team_goals
        );

        return {
          ...game,
          total_goals: total,
          over_under_map, // keyed by line (e.g. { "2.5": "Over 2.5", "2": "Void/Refund", ... })
          over_under_array, // array of { line, result } for easier iteration
        };
      });

    const homeGamesAnalyzed = analyzeGames(homeGames);
    const awayGamesAnalyzed = analyzeGames(awayGames);

    return Response.json(
      {
        success: true,
        lines: goalLines,
        homeGames: homeGamesAnalyzed,
        awayGames: awayGamesAnalyzed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ API Error:", error);
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
