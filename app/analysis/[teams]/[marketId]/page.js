// app/analysis/[teams]/[marketId]/page.js

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MarketAnalysisClient from "@/components/MarketAnalysis/MarketAnalysisClient";

export default function MarketAnalysisPage() {
  const { teams, marketId } = useParams(); // ✅ Get params client-side
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeTeamLogo, setHomeTeamLogo] = useState("");
  const [awayTeamLogo, setAwayTeamLogo] = useState("");
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!marketId) return;

    const fetchMarket = async () => {
      setLoading(true);
      try {
        // Client fetch — no need for headers()
        const res = await fetch(`/api/markets/${marketId}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch market");

        const result = await res.json();
        const data = result.data || {};

        setHomeTeam(data.home_team || "");
        setAwayTeam(data.away_team || "");
        setHomeTeamLogo(data.home_team_logo || "");
        setAwayTeamLogo(data.away_team_logo || "");
        setMarkets(data.markets || []);
      } catch (err) {
        console.error("❌ Error fetching market client-side:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [marketId]);

  if (loading) return <p>Loading market data…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <MarketAnalysisClient
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      homeTeamLogo={homeTeamLogo}
      awayTeamLogo={awayTeamLogo}
      markets={markets}
    />
  );
}
MarketAnalysisPage.displayName = "MarketAnalysisPage";
MarketAnalysisPage.revalidate = 0; // Disable caching for dynamic data
MarketAnalysisPage.fetchCache = "force-no-store"; // Ensure fresh data on each request
