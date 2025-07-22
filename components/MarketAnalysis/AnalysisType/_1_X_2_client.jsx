"use client";

import { VictoryPie } from "victory";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function OneXTwoSummary({ data }) {
  if (!data || !data.homeGames || !data.awayGames) return null;

  const { homeGames = [], awayGames = [] } = data;

  // Infer team names
  const homeTeam = homeGames[0]?.home_team_name || "Home";
  const awayTeam = awayGames[0]?.away_team_name || "Away";

  // Calculate 1X2 stats
  let homeWinCount = 0;
  let drawCount = 0;
  let awayWinCount = 0;
  let totalGames = homeGames.length + awayGames.length;

  [...homeGames, ...awayGames].forEach((game) => {
    const homeGoals = game.home_team_goals;
    const awayGoals = game.away_team_goals;

    if (homeGoals > awayGoals) {
      if (game.home_team_name === homeTeam) homeWinCount++;
      else awayWinCount++;
    } else if (awayGoals > homeGoals) {
      if (game.away_team_name === awayTeam) awayWinCount++;
      else homeWinCount++;
    } else {
      drawCount++;
    }
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

  const renderTable = (games) => (
    <table className="w-full border text-left text-xs">
      <thead>
        <tr className="bg-gray-100 text-gray-600">
          <th className="p-1">Date</th>
          <th className="p-1">Home</th>
          <th className="p-1 text-center">Score</th>
          <th className="p-1">Away</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game, i) => (
          <tr key={i} className="text-xs text-gray-700">
            <td className="p-1">{formatDate(game.game_date)}</td>
            <td className="p-1">{game.home_team_name}</td>
            <td className="p-1 text-center font-semibold">
              {game.home_team_goals} - {game.away_team_goals}
            </td>
            <td className="p-1">{game.away_team_name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

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
            <div ClassName="w-64 h-64 ">
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
          </div>
        </SwiperSlide>

        {/* Home Team Games */}
        {homeGames.length > 0 && (
          <SwiperSlide>
            <div>
              <h5 className="text-gray-800 font-semibold text-sm mb-2">
                Last 10 {homeTeam} Games
              </h5>
              {renderTable(homeGames)}
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
              {renderTable(awayGames)}
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
