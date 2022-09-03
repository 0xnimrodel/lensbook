import Link from "next/link";
import { useState } from "react";
import ConnectBtn from "./ConnectBtn";
import Search from "./SearchBar";

export default function Navbar() {
  return (
    <header className="bg-white border-b-2 border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-emerald-500 lg:border-none">
          <div className="flex w-full items-center justify-between">
            <Link href="/">
              <span className="text-lg text-emerald-600 font-medium cursor-pointer">
                🌱 Lensbook
              </span>
            </Link>
            <Search />
            <ConnectBtn />
          </div>
        </div>
      </nav>
    </header>
  );
}
