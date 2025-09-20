"use client";

import React from "react";
import { Accordion } from "@/components/ui/accordion";
import MarketGroupAccordion from "./MarketGroupAccordion";

export default function MarketAnalysisClient({ homeTeam, awayTeam, markets }) {
  // Group markets by 'group' field
  const grouped = markets?.reduce((acc, market) => {
    const group = market.name || "Unknown";
    if (!acc[group]) acc[group] = [];
    acc[group].push(market);
    return acc;
  }, {});

  // Sort each group alphabetically by market.name
  for (const group in grouped) {
    grouped[group].sort((a, b) => a.name.localeCompare(b.name));
    //console.log(`Group: ${group}`, grouped[group]);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Match Analysis</h1>

      {homeTeam && awayTeam ? (
        <>
          <p className="text-lg">
            Home Team: <strong>{homeTeam}</strong>
          </p>
          <p className="text-lg mb-4">
            Away Team: <strong>{awayTeam}</strong>
          </p>

          <h2 className="text-2xl underline text-center mb-6">
            Available SportyBet Markets
          </h2>

          {markets?.length ? (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(grouped).map(
                ([groupName, groupMarkets], index) => (
                  <MarketGroupAccordion
                    key={index}
                    groupName={groupName}
                    marketGuide={groupMarkets[0]?.marketGuide}
                    markets={groupMarkets}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                  />
                )
              )}
            </Accordion>
          ) : (
            <p className="text-yellow-600 mt-4">Market data not available.</p>
          )}
        </>
      ) : (
        <p className="text-red-500">Missing team data in URL parameters.</p>
      )}
    </div>
  );
}
