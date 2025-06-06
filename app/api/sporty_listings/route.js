// app/api/route.ts
import axios, { AxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents?sportId=sr%3Asport%3A1&marketId=1%2C18%2C10%2C29%2C11%2C26%2C36%2C14%2C60100&pageSize=100&pageNum=1&option=1&_t=1749223526816";

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

  try {
    const response = await axios.get(url, {
      headers: headers,
      timeout: 10000, // 10 seconds timeout
    });

    // Process the data to extract relevant information
    const tournaments = response.data?.data?.tournaments || [];
    const simplifiedData = tournaments.map((tournament) => ({
      tournamentName: tournament.name,
      events: tournament.events?.map((event) => ({
        homeTeam: event.homeTeamName,
        awayTeam: event.awayTeamName,
        startTime: event.estimateStartTime,
        status: event.matchStatus,
      })) || [],
    }));

    return NextResponse.json({
      success: true,
      data: simplifiedData,
    }, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    let errorMessage = "Failed to fetch data";
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      const axiosError = error;
      errorMessage = axiosError.message;
      statusCode = axiosError.response?.status || 500;
      
      if (axiosError.response?.status === 404) {
        errorMessage = "Resource not found";
      } else if (axiosError.code === 'ECONNABORTED') {
        errorMessage = "Request timeout";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Fetch error:", errorMessage);
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, {
      status: statusCode,
    });
  }
}