"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import MatchupBanner from "./MatchupBanner";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TOURNAMENTS_PER_PAGE = 5;

function TournamentGroups() {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cacheKey = "sporty_listings_cache";
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          const age = Date.now() - timestamp;

          if (age < 7200000) {
            console.log("Using cached data");
            setTournaments(data);
            setLoading(false);
            return;
          }
        }

        const res = await axios.get("/api/sporty_listings");
        const rawData = res.data?.data || [];

        const grouped = rawData.filter(
          (tournament) =>
            tournament.events &&
            tournament.events.some((e) => e.homeTeam && e.awayTeam)
        );

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: grouped })
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

  const scrollToSection = (globalIndex) => {
    const page = Math.floor(globalIndex / TOURNAMENTS_PER_PAGE) + 1;
    setCurrentPage(page);
    setExpanded((prev) => ({ ...prev, [globalIndex]: true }));

    setTimeout(() => {
      sectionRefs.current[globalIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    setShowSidebar(false); // close mobile sidebar
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-48">
        <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (tournaments.length === 0) {
    return <p className="text-center text-gray-500">No tournaments found.</p>;
  }

  return (
    <div className="flex bg-white min-h-[100dvh]">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-green-100 p-4 pt-0 sticky top-[64px] h-screen overflow-y-auto border-r border-green-200">
        <h2 className="text-lg font-bold py-3 border-b-2 -mx-4 border-white sticky top-0 text-green-800 text-center bg-green-100">
          Tournaments
        </h2>
        <ul className="space-y-2">
          {tournaments.map((tournament, index) => (
            <li
              key={index}
              onClick={() => scrollToSection(index)}
              className="cursor-pointer text-green-700 hover:text-green-900 text-sm"
            >
              {tournament.tournamentName}
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile Sidebar */}
      <div
        id="mobile_menu"
        className="md:hidden fixed top-[64px] bg-green-100 left-0 z-50"
      >
        <button onClick={() => setShowSidebar(true)}>
          <Menu className="text-green-700" />
        </button>
      </div>

      {showSidebar && (
        <div className="fixed top-[64px] inset-0 z-50 bg-black/20  flex">
          <div className="bg-green-100 w-64 p-4 h-full overflow-y-auto">
            <h2 className="text-lg   font-bold py-3 border-b-2 -mx-1 w-full border-white sticky top-0 text-green-800 text-center bg-green-100">
              Tournaments
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 transform"
                onClick={() => setShowSidebar(false)}
              >
                <X />
              </button>
            </h2>
            <ul className="space-y-2">
              {tournaments.map((tournament, index) => (
                <li
                  key={index}
                  onClick={() => scrollToSection(index)}
                  className="cursor-pointer text-green-700 hover:text-green-900 text-sm"
                >
                  {tournament.tournamentName}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1" onClick={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 flex flex-col items-center space-y-6">
        {currentTournaments.map((tournament, localIndex) => {
          const globalIndex = startIndex + localIndex;
          const isOpen = expanded[globalIndex] ?? true;

          return (
            <div
              ref={(el) => (sectionRefs.current[globalIndex] = el)}
              key={globalIndex}
              className="flex flex-col space-y-2 border rounded-lg bg-white shadow-md w-full max-w-[600px]"
            >
              <div
                className="flex justify-between items-center sticky z-20 top-[64px] bg-white px-4 py-2 cursor-pointer"
                onClick={() => toggleExpand(globalIndex)}
              >
                <h2 className="text-lg font-bold text-gray-800">
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
        <div className="flex bg-green-100 z-30 w-fit fixed bottom-0 px-4 py-2 rounded shadow mt-8 space-x-4">
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
    </div>
  );
}

export default TournamentGroups;
