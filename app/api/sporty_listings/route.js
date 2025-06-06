import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents";
  const headers = {
    "Sec-Ch-Ua-Platform": "\"Windows\"",
    "Accept-Language": "en",
    "Sec-Ch-Ua": "\"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "Clientid": "web",
    "Operid": "2",
    "Sec-Ch-Ua-Mobile": "?0",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Platform": "web",
    "Accept": "*/*",
    "Referer": "https://www.sportybet.com/ng/sport/football",
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
        events: tournament.events?.map((event) => ({
          homeTeam: event.homeTeamName,
          awayTeam: event.awayTeamName,
          startTime: event.estimateStartTime,
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
      errorMessage = error.response?.status === 404
        ? "No more pages"
        : error.message;
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
