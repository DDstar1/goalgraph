"use client";

import { useEffect, useState } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Loader2, XCircle } from "lucide-react";

export default function MarketGroupAccordion({
  groupName,
  homeTeam,
  awayTeam,
  markets,
  marketGuide,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        ) : markets.length ? (
          <ul className="space-y-3">
            {markets.map((market) => (
              <li
                key={market.id}
                className="p-4 border rounded-md bg-white shadow-sm"
              >
                <p>
                  <strong>Title:</strong> {market.title}
                </p>
                <p>
                  <strong>Description:</strong> {market.desc}
                </p>
                <p>
                  <strong>Specifier:</strong> {market.specifier || "—"}
                </p>
                <p>
                  <strong>Source:</strong> {market.sourceType}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No markets found for this group.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
