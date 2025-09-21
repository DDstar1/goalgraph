"use client";

import { useMemo } from "react";
import { VictoryPie } from "victory";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function DoubleChanceClient({ data }) {
  if (!data) return null;

  const { homeGames = [], awayGames = [] } = data;
  const allGames = [...homeGames, ...awayGames];

  // Calculate Double Chance stats
  const stats = useMemo(() => {
    let dc_1X = 0,
      dc_X2 = 0,
      dc_12 = 0;

    allGames.forEach((g) => {
      const res = g.double_chance;
      if (res === "1X") dc_1X++;
      else if (res === "X2") dc_X2++;
      else if (res === "12") dc_12++;
    });

    const total = dc_1X + dc_X2 + dc_12 || 1;
    return {
      dc_1X,
      dc_X2,
      dc_12,
      total,
      percentages: {
        dc_1X: Math.round((dc_1X / total) * 100),
        dc_X2: Math.round((dc_X2 / total) * 100),
        dc_12: Math.round((dc_12 / total) * 100),
      },
    };
  }, [allGames]);

  const pieData = [
    { x: "1X", y: stats.percentages.dc_1X },
    { x: "X2", y: stats.percentages.dc_X2 },
    { x: "12", y: stats.percentages.dc_12 },
  ];

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Double Chance Analysis</h3>
      </div>

      {/* Swiper with two slides */}
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
      >
        {/* Slide 1: Pie chart + stats */}
        <SwiperSlide>
          <div className="flex flex-col items-center">
            {/* Pie Chart */}
            <div className="flex justify-center h-60 w-72">
              <VictoryPie
                data={pieData}
                colorScale={["#22c55e", "#3b82f6", "#f59e0b"]} // green=1X, blue=X2, orange=12
                innerRadius={40}
                width={250}
                height={250}
                animate={{ duration: 700, easing: "exp" }}
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

            {/* Stats Summary */}
            <div className="mt-3 text-sm text-gray-700 text-center">
              <p>Total Games: {stats.total}</p>
              <p>
                1X: {stats.dc_1X} • X2: {stats.dc_X2} • 12: {stats.dc_12}
              </p>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2: Table */}
        <SwiperSlide>
          <div className="mt-5 overflow-x-auto h-[50vh]">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Match</th>
                  <th className="border px-2 py-1 text-left">Score</th>
                  <th className="border px-2 py-1 text-left">Double Chance</th>
                </tr>
              </thead>
              <tbody>
                {allGames.map((g, idx) => (
                  <tr key={idx} className="odd:bg-gray-50">
                    {/* Date */}
                    <td className="border px-2 py-1">
                      {g.game_date
                        ? new Date(g.game_date).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Match */}
                    <td className="border px-2 py-1">
                      {g.home_team_name} vs {g.away_team_name}
                    </td>

                    {/* Score */}
                    <td className="border px-2 py-1">
                      {g.home_team_goals} - {g.away_team_goals}
                    </td>

                    {/* Double Chance Result */}
                    <td className="border px-2 py-1">
                      {g.double_chance || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
