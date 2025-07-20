"use client";
import React from "react";
import { VictoryPie } from "victory";

export default function OneXTwo({ data }) {
  if (!data || !data.homeGames || !data.awayGames) return null;

  const { homeGames, awayGames } = data;

  const countOutcomes = (games, team, isHomePerspective = true) => {
    let win = 0,
      draw = 0,
      loss = 0;

    for (const g of games) {
      const homeGoals = g.home_team_goals;
      const awayGoals = g.away_team_goals;
      const teamIsHome = g.home_team_name.toLowerCase() === team.toLowerCase();

      const outcome =
        homeGoals > awayGoals
          ? "home"
          : homeGoals < awayGoals
          ? "away"
          : "draw";

      if (outcome === "draw") {
        draw++;
      } else if (
        (outcome === "home" && teamIsHome) ||
        (outcome === "away" && !teamIsHome)
      ) {
        win++;
      } else {
        loss++;
      }
    }

    const total = win + draw + loss || 1;
    return {
      win: (win / total) * 100,
      draw: (draw / total) * 100,
      loss: (loss / total) * 100,
    };
  };

  const homeTeam = homeGames[0]?.home_team_name ?? "Home";
  const awayTeam = awayGames[0]?.away_team_name ?? "Away";

  const homeStats = countOutcomes(homeGames, homeTeam);
  const awayStats = countOutcomes(awayGames, awayTeam, false);

  const homeWin = ((homeStats.win + awayStats.loss) / 2).toFixed(1);
  const draw = ((homeStats.draw + awayStats.draw) / 2).toFixed(1);
  const awayWin = ((homeStats.loss + awayStats.win) / 2).toFixed(1);

  const pieData = [
    { x: `${homeTeam}\nWin`, y: Number(homeWin) },
    { x: "Draw", y: Number(draw) },
    { x: `${awayTeam}\nWin`, y: Number(awayWin) },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-md border mb-6 shadow-sm">
      <h4 className="font-semibold text-gray-800 mb-2">1X2 Prediction</h4>
      <ul className="text-sm space-y-1 text-gray-700 mb-4">
        <li>
          <strong>{homeTeam} Win:</strong> {homeWin}%
        </li>
        <li>
          <strong>Draw:</strong> {draw}%
        </li>
        <li>
          <strong>{awayTeam} Win:</strong> {awayWin}%
        </li>
      </ul>

      <VictoryPie
        data={pieData}
        colorScale={["#34d399", "#fbbf24", "#f87171"]}
        radius={90}
        innerRadius={40}
        labels={({ datum }) => `${datum.x}\n${datum.y}%`}
        style={{
          labels: { fontSize: 10, fill: "#374151", textAlign: "center" },
        }}
      />
    </div>
  );
}
