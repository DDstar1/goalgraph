import axios from "axios";
import { NextResponse } from "next/server";
import espn_all_teams from "@/public/json/espn_all_teams";

export async function GET() {
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

  let pageNum = 1;
  const maxPages = 100; // safety limit to prevent infinite loop
  const allTournaments = [];

  try {
    while (pageNum <= maxPages) {
      console.log(`Fetching page ${pageNum}...`);

      const url = `${baseUrl}?sportId=sr%3Asport%3A1&marketId=1%2C18%2C10%2C29%2C11%2C26%2C36%2C14%2C60100&pageSize=100&pageNum=${pageNum}&option=1&_t=${Date.now()}`;

      const response = await axios.get(url, {
        headers,
        timeout: 10000,
      });

      const tournaments = response.data?.data?.tournaments || [];

      if (tournaments.length === 0) {
        console.log(`no data returned`);

        break; // stop if no data returned
      }

      const simplifiedData = tournaments.map((tournament) => ({
        tournamentName: tournament.name,
        events:
          tournament.events?.map((event) => ({
            homeTeam: event.homeTeamName,
            homeTeamLogo: espnLookup(event.homeTeamName),
            awayTeam: event.awayTeamName,
            awayTeamTeamLogo: espnLookup(event.awayTeamName),
            startTime: event.estimateStartTime,
            SportyMatchId: event.eventId,
            status: event.matchStatus,
          })) || [],
      }));

      allTournaments.push(...simplifiedData);
      pageNum++;
    }

    return NextResponse.json(
      { success: true, totalPages: pageNum - 1, data: allTournaments },
      { status: 200 }
    );
  } catch (error) {
    let errorMessage = "Failed to fetch data";
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.status === 404 ? "No more pages" : error.message;
      statusCode = error.response?.status || 500;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Fetch error:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Attempts to find a matching ESPN team logo URL for a given team name.
 * - Normalizes the team name by removing short words (≤ 2 letters), converting to lowercase, and joining with hyphens.
 * - Searches the espn_all_teams list for a partial match.
 * - If a match is found, extracts the team ID and returns the ESPN logo URL.
 **/
function espnLookup(teamName) {
  if (!teamName) return null;

  const name = teamName
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2) // remove 2-letter or shorter words
    .join("-");

  const match = espn_all_teams.find((entry) =>
    entry.toLowerCase().includes(name)
  );

  if (!match)
    return "https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default-team-logo-500.png";

  const [id] = match.split("/");
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
}
