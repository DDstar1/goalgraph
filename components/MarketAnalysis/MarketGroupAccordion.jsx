"use client";

import { useEffect, useState } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Loader2, XCircle } from "lucide-react";
import _1_X_2 from "./AnalysisType/_1_X_2_client";
import _1X2_2UP from "./AnalysisType/_1X2_2UP_client";
import _Over_Under from "./AnalysisType/_Over_Under_client";
import _Double_Chance from "./AnalysisType/_Double_Chance_client";

// Map group names to URL-safe slugs
const groupSlugMap = {
  "1X2": "1x2",
  "1X2 - 2UP": "1x2-2up",
  "Over/Under": "over-under",
  "Double Chance": "double-chance",
  Handicap: "handicap",
  "GG/NG": "gg-ng",
  "Draw No Bet": "draw-no-bet",
  "Odd/Even": "odd-even",
  "Over/Under & GG/NG": "over-under-gg-ng",
};

// Fallback slugify in case groupName is not in map
const toSlug = (name) => {
  return (
    groupSlugMap[name] ||
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  );
};

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

  const slug = toSlug(groupName);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(false);

      console.log("🏠 homeTeam:", homeTeam);
      console.log("🛫 awayTeam:", awayTeam);

      try {
        const res = await fetch(`/api/analysis/${slug}`, {
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
  }, [slug, homeTeam, awayTeam, markets]);

  return (
    <AccordionItem value={`item-${slug}`}>
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
            {(() => {
              console.log("👉 groupName:", groupName);
              console.log("👉 analysisData:", analysisData);

              if (groupName === "1X2" && analysisData) {
                console.log("✅ Rendering <_1_X_2 />");
                return (
                  <div>
                    <_1_X_2 data={analysisData} />
                  </div>
                );
              } else if (groupName === "1X2 - 2UP" && analysisData) {
                console.log("✅ Rendering <summary_1X2_2UP />");
                return (
                  <div>
                    <_1X2_2UP data={analysisData} />
                  </div>
                );
              } else if (groupName === "Over/Under" && analysisData) {
                console.log("✅ Rendering <summary_1X2_2UP />");
                return (
                  <div>
                    <_Over_Under data={analysisData} />
                  </div>
                );
              } else if (groupName === "Double Chance" && analysisData) {
                console.log("✅ Rendering <Double Chance />");
                return (
                  <div>
                    <_Double_Chance data={analysisData} />
                  </div>
                );
              } else {
                console.log("❌ No matching group, nothing to render");
                return null;
              }
            })()}
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
