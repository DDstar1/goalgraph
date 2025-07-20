// app/analysis/[teams]/[marketId]/page.js

import MarketAnalysisClient from "@/components/MarketAnalysis/MarketAnalysisClient";
import { headers } from "next/headers";

export default async function GET(context) {
  const { params } = await context; // ✅ Await context
  const { teams, marketId } = params; // ✅ No need to await this

  let home_team = "";
  let away_team = "";
  let home_team_logo = "";
  let away_team_logo = "";
  let markets = [];

  try {
    const headerList = await headers(); // ✅ MUST be awaited
    const baseUrl =
      headerList.get("x-forwarded-host") || headerList.get("host");
    const protocol = baseUrl.includes("localhost") ? "http" : "https";

    const res = await fetch(
      `${protocol}://${baseUrl}/api/markets/${marketId}`,
      {
        cache: "no-store", // Optional: to always get fresh data
      }
    );

    console.log(`${protocol}://${baseUrl}/api/markets/${marketId}`);

    if (!res.ok) throw new Error("Failed to fetch market");

    const result = await res.json();
    const data = result.data || {};

    home_team = data.home_team || "";
    away_team = data.away_team || "";
    home_team_logo = data.home_team_logo || "";
    away_team_logo = data.away_team_logo || "";
    markets = data.markets || [];
  } catch (err) {
    console.error("❌ Error fetching market server-side:", err);
  }

  return (
    <MarketAnalysisClient
      homeTeam={home_team}
      awayTeam={away_team}
      homeTeamLogo={home_team_logo}
      awayTeamLogo={away_team_logo}
      markets={markets}
    />
  );
}
