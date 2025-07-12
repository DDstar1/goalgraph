import React from "react";

const MatchupBanner = ({
  team_A_name,
  team_A_logo,
  team_B_name,
  team_B_logo,
  timestamp,
}) => {
  return (
    <div className="relative flex flex-col items-center max-w-[97vw] mb-3">
      {/* Banner Row */}
      <div className="flex items-center">
        {/* LEFT SIDE */}
        <div className="relative px-20  py-5 mr-[-16px] z-5">
          <div className="absolute inset-0 bg-black clip-right"></div>
          <div className="absolute inset-[1px] bg-white pl-3.5 clip-right flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <img src={team_A_logo} alt={team_A_name} className="w-6 h-6" />
              <span className="font-semibold text-center text-xs text-gray-800 break-words whitespace-pre-line w-fit">
                {team_A_name.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER VS CIRCLE */}
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center  text-lg font-bold text-gray-700 shadow z-10 border-2 border-gray-300">
          VS
        </div>

        {/* RIGHT SIDE */}
        <div className="relative px-20 py-5 ml-[-16px] z-5">
          <div className="absolute inset-0 bg-black clip-left"></div>
          <div className="absolute inset-[1px] bg-white  pr-3.5 clip-left flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-center text-xs text-gray-800 break-words whitespace-pre-line w-fit">
                {team_B_name.toUpperCase()}
              </span>
              <img src={team_B_logo} alt={team_B_name} className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Start Time */}
      <div className="text-xs text-gray-700 font-medium -mt-[2px]">
        {formatTimestamp(timestamp)}
      </div>
    </div>
  );
};

export default MatchupBanner;

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
