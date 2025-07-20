"use client";

import { useEffect, useState } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Loader2, XCircle } from "lucide-react";
import _1_X_2 from "./AnalysisType/_1_X_2_client";

export default function MarketGroupAccordion({
  groupName,
  homeTeam,
  awayTeam,
  markets,
  marketGuide,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/analysis/${groupName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            homeTeam,
            awayTeam,
            markets,
          }),
        });

        if (!res.ok) throw new Error("Failed to fetch analysis");

        const data = await res.json();
        setAnalysisData(data);
      } catch (err) {
        console.error("❌ Error fetching group analysis:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [groupName, homeTeam, awayTeam, markets]);

  return (
    <AccordionItem value={`item-${groupName}`}>
      <AccordionTrigger className="text-left">
        <div className="flex justify-between w-full items-center">
          <span>{groupName}</span>
          {error ? (
            <XCircle className="ml-2 h-4 w-4 text-red-500" />
          ) : loading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin text-green-600" />
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <p className="text-sm italic mb-3 text-gray-600">{marketGuide}</p>

        {error ? (
          <p className="text-red-500 text-sm">Failed to load markets.</p>
        ) : loading ? (
          <p className="text-sm text-gray-500">Loading markets...</p>
        ) : (
          <>
            {groupName === "1X2" && analysisData && (
              <div>
                advsdv <_1_X_2 data={analysisData} />
              </div>
            )}
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
