"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Nav = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Fixtures", href: "/fixtures" },
  ];

  return (
    <nav className="bg-green-600 px-6 py-4 flex justify-between items-center sticky top-0 z-60 shadow-md">
      <Link href="/" className="text-2xl font-bold text-white">
        GoalGraph
      </Link>
      <div className="flex gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-white hover:text-green-200 transition ${
              pathname === link.href ? "font-semibold underline" : ""
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Nav;
