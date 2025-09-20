"use client";

import { VictoryPie } from "victory";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function _1X2_2UP({ data }) {
  if (!data || !data.homeGames || !data.awayGames) return null;

  const { homeGames = [], awayGames = [] } = data;

  // 🔹 Infer most frequent team name
  function inferTeamName(games, key) {
    const counts = {};
    games.forEach((g) => {
      const name = g[key];
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  }

  const homeTeam =
    inferTeamName(homeGames, "home_team_name") ||
    inferTeamName(awayGames, "home_team_name") ||
    "Home";

  const awayTeam =
    inferTeamName(awayGames, "away_team_name") ||
    inferTeamName(homeGames, "away_team_name") ||
    "Away";

  console.log("🏠 Inferred Home Team:", homeTeam);
  console.log("🛫 Inferred Away Team:", awayTeam);

  // 1X2 stats
  let homeWinCount = 0;
  let drawCount = 0;
  let awayWinCount = 0;
  const totalGames = homeGames.length + awayGames.length;

  [...homeGames, ...awayGames].forEach((game) => {
    if (game.result_1X2 === "1") homeWinCount++;
    else if (game.result_1X2 === "2") awayWinCount++;
    else drawCount++;
  });

  const toPercent = (count) =>
    totalGames ? Math.round((count / totalGames) * 100) : 0;

  const pieData = [
    { x: `${homeTeam}`, y: toPercent(homeWinCount) },
    { x: "Draw", y: toPercent(drawCount) },
    { x: `${awayTeam}`, y: toPercent(awayWinCount) },
  ];

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // 2UP summary
  const twoUPSummary = [...homeGames, ...awayGames].reduce((acc, g) => {
    if (g.result_2UP === "Home 2UP") {
      const team = g.home_team_name;
      acc[team] = (acc[team] || 0) + 1;
    } else if (g.result_2UP === "Away 2UP") {
      const team = g.away_team_name;
      acc[team] = (acc[team] || 0) + 1;
    }

    return acc;
  }, {}); // <-- plain empty

  console.log(twoUPSummary);

  const renderTable = (games, team) => {
    console.log("Rendering table for:", team);
    console.log("Games:", games);

    return (
      <table className="w-full border text-left text-xs">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="p-1">Date</th>
            <th className="p-1">Home</th>
            <th className="p-1 text-center">Score</th>
            <th className="p-1">Away</th>
            <th className="p-1 text-center">1X2</th>
            <th className="p-1 text-center">2UP</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, i) => {
            console.log("Game:", game);

            const show2UP =
              (game.result_2UP === "Home 2UP" &&
                game.home_team_name === team) ||
              (game.result_2UP === "Away 2UP" && game.away_team_name === team);

            return (
              <tr key={i} className="text-xs text-gray-700">
                <td className="p-1">{formatDate(game.game_date)}</td>
                <td className="p-1">{game.home_team_name}</td>
                <td className="p-1 text-center font-semibold">
                  {game.home_team_goals} - {game.away_team_goals}
                </td>
                <td className="p-1">{game.away_team_name}</td>
                <td className="p-1 text-center">{game.result_1X2}</td>
                <td className="p-1 text-center">{show2UP ? "✅" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="rounded-md border bg-white p-4 shadow-sm">
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="custom-swiper"
      >
        {/* Chart Slide */}
        <SwiperSlide>
          <div className="flex flex-col items-center">
            <h4 className="font-semibold text-gray-800 mb-4 text-sm">
              1X2 Result Summary
            </h4>
            <div className="w-64 h-64">
              <VictoryPie
                data={pieData}
                colorScale={["#34d399", "#fbbf24", "#f87171"]}
                radius={60}
                innerRadius={30}
                animate={{ duration: 1000, easing: "exp" }}
                labels={({ datum }) => `${datum.x}\n${datum.y}%`}
                style={{
                  labels: {
                    fontSize: 12,
                    fill: "#374151",
                    textAlign: "center",
                  },
                }}
              />
            </div>

            {/* 2UP Summary */}
            <div className="mt-4 text-xs text-gray-700">
              <p>
                <strong>2UP Summary:</strong> {homeTeam} 2UP:{" "}
                {twoUPSummary[homeTeam] || 0}, {awayTeam} 2UP:{" "}
                {twoUPSummary[awayTeam] || 0}
              </p>
            </div>
          </div>
        </SwiperSlide>

        {/* Home Team Games */}
        {homeGames.length > 0 && (
          <SwiperSlide>
            <div>
              <h5 className="text-gray-800 font-semibold text-sm mb-2">
                Last 10 {homeTeam} Games
              </h5>
              {renderTable(homeGames, homeTeam)}
            </div>
          </SwiperSlide>
        )}

        {/* Away Team Games */}
        {awayGames.length > 0 && (
          <SwiperSlide>
            <div>
              <h5 className="text-gray-800 font-semibold text-sm mb-2">
                Last 10 {awayTeam} Games
              </h5>
              {renderTable(awayGames, awayTeam)}
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* Custom Pagination Styles */}
      <style jsx global>{`
        .custom-swiper .swiper-pagination-bullet {
          background-color: #d1fae5;
          opacity: 1;
        }
        .custom-swiper .swiper-pagination-bullet-active {
          background-color: #10b981;
        }
      `}</style>
    </div>
  );
}
