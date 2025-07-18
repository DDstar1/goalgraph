// app/analysis/[teams]/[marketId]/page.js

import MarketAnalysisClient from "@/components/MarketAnalysis/MarketAnalysisClient";

export default async function AnalysisPage({ params }) {
  const { teams, marketId } = params;

  let home_team = "";
  let away_team = "";
  let home_team_logo = "";
  let away_team_logo = "";
  let markets = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/markets/${marketId}`
    );

    if (!res.ok) throw new Error("Failed to fetch market");

    const result = await res.json();

    const data = result.data || {};

    home_team = data.home_team || "";
    away_team = data.away_team || "";
    home_team_logo = data.home_team_logo || "";
    away_team_logo = data.away_team_logo || "";
    markets = data.markets || [];

    console.log("✅ Market data:", markets);
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
