// app/analysis/page.tsx (or page.jsx if using JS)
"use client";

import { useSearchParams } from "next/navigation";

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const homeTeam = searchParams.get("home");
  const awayTeam = searchParams.get("away");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Match Analysis</h1>
      {homeTeam && awayTeam ? (
        <>
          <p className="text-lg">
            Home Team: <strong>{homeTeam}</strong>
          </p>
          <p className="text-lg">
            Away Team: <strong>{awayTeam}</strong>
          </p>
          {/* Add your analysis logic here */}
        </>
      ) : (
        <p className="text-red-500">Missing team data in URL parameters.</p>
      )}
    </div>
  );
}
