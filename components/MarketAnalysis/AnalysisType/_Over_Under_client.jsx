"use client";

import { useMemo, useState } from "react";
import { VictoryPie, VictoryLegend } from "victory";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function OverUnderClient({ data }) {
  if (!data) return null;

  const { lines = [], homeGames = [], awayGames = [] } = data;
  const [selectedLine, setSelectedLine] = useState("2.5");

  const allGames = [...homeGames, ...awayGames];

  // Calculate stats
  const stats = useMemo(() => {
    let over = 0,
      under = 0,
      voids = 0;

    allGames.forEach((g) => {
      const res = g.over_under_map?.[selectedLine];
      if (!res) return;
      if (res.startsWith("Over")) over++;
      else if (res.startsWith("Under")) under++;
      else if (res.includes("Void")) voids++;
    });

    const total = over + under + voids || 1;
    return {
      over,
      under,
      voids,
      total,
      percentages: {
        over: Math.round((over / total) * 100),
        under: Math.round((under / total) * 100),
        voids: Math.round((voids / total) * 100),
      },
    };
  }, [allGames, selectedLine]);

  const pieData = [
    { x: `Over ${selectedLine}`, y: stats.percentages.over },
    { x: `Under ${selectedLine}`, y: stats.percentages.under },
    ...(stats.voids > 0 ? [{ x: "Void", y: stats.percentages.voids }] : []),
  ];

  return (
    <div className="p-4 border rounded-md shadow-sm bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Over/Under Analysis</h3>
        <select
          value={selectedLine}
          onChange={(e) => setSelectedLine(e.target.value)}
          className="border p-1 rounded text-sm"
        >
          {lines.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
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
                colorScale={["#22c55e", "#ef4444", "#9ca3af"]} // green=Over, red=Under, gray=Void
                innerRadius={40}
                width={250}
                height={250}
                animate={{ duration: 700, easing: "exp" }}
                labels={({ datum }) => `${datum.x}\n${datum.y}%`} // show label + percentage
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
                Over: {stats.over} • Under: {stats.under}
                {stats.voids > 0 && ` • Void: ${stats.voids}`}
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
                  <th className="border px-2 py-1 text-left">Result</th>
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

                    {/* Over/Under Result */}
                    <td className="border px-2 py-1">
                      {g.over_under_map?.[selectedLine] || "-"}
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
