"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import MatchupBanner from "../components/MatchupBanner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TOURNAMENTS_PER_PAGE = 5;

function TournamentGroups() {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/sporty_listings");
        const data = res.data?.data || [];

        const grouped = data.filter(
          (tournament) =>
            tournament.events &&
            tournament.events.some((e) => e.homeTeam && e.awayTeam)
        );

        setTournaments(grouped);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(tournaments.length / TOURNAMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOURNAMENTS_PER_PAGE;
  const currentTournaments = tournaments.slice(
    startIndex,
    startIndex + TOURNAMENTS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-48">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (tournaments.length === 0) {
    return <p className="text-center text-gray-500">No tournaments found.</p>;
  }

  return (
    <div className="space-y-6 bg-white px-4 py-6 flex flex-col items-center min-h-[100dvh]">
      {currentTournaments.map((tournament, index) => {
        const isOpen = expanded[index] ?? true;

        return (
          <div
            key={index}
            className="flex flex-col space-y-2 border rounded-lg bg-white shadow-md w-full max-w-[600px]"
          >
            <div
              className="flex justify-between items-center sticky top-0 bg-white z-50 px-4 py-2 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <h2 className="text-lg font-bold text-gray-800 ">
                {tournament.tournamentName}
              </h2>
              {isOpen ? (
                <ChevronUp color="black" size={20} />
              ) : (
                <ChevronDown color="black" size={20} />
              )}
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pb-3 pt-2">
                    {tournament.events.map(
                      (match, idx) =>
                        match.homeTeam &&
                        match.awayTeam && (
                          <MatchupBanner
                            key={idx}
                            team_A_name={match.homeTeam}
                            team_A_logo={match.homeTeamLogo}
                            team_B_name={match.awayTeam}
                            team_B_logo={match.awayTeamTeamLogo}
                            timestamp={match.startTime}
                          />
                        )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Pagination Controls */}
      <div className="flex z-20 bg-blue-100 w-fit fixed bottom-0 px-4 py-2 rounded shadow mt-8 space-x-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700 self-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TournamentGroups;
