"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [gamesOpen, setGamesOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/404");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Top Navigation */}
        <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold tracking-tight text-black">SpeakPro AI</h2>
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="px-5 py-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              Home
            </Link>
            <button
              onClick={handleSignOut}
              className="px-5 py-2 bg-red-950 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </header>

        {/* Main content with sidebar */}
        <div className="flex flex-1">
            
          {/* Sidebar */}
          <aside className="w-56 bg-gray-100 border-r border-gray-200 p-4">
            <nav className="space-y-4">
              <Link
                href="/dashboard"
                className="block text-gray-800 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors"
              >
                📊 Dashboard
              </Link>

              {/* Games Dropdown */}
              <div>
                <button
                  onClick={() => setGamesOpen(!gamesOpen)}
                  className="flex items-center justify-between w-full text-gray-800 font-semibold px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <span>🎮 Games</span>
                  {gamesOpen ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    gamesOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pl-4 space-y-2">
                    <Link
                      href="/dashboard/game1"
                      className="block px-2 py-1 rounded-md text-black hover:bg-gray-200 transition-all"
                    >
                      Game 1
                    </Link>
                    <Link
                      href="/dashboard/game2"
                      className="block px-2 py-1 rounded-md text-black hover:bg-gray-200 transition-all"
                    >
                      Game 2
                    </Link>
                    <Link
                      href="/dashboard/game3"
                      className="block px-2 py-1 rounded-md text-black hover:bg-gray-200 transition-all"
                    >
                      Game 3
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </aside>

          {/* Page Content */}
          <main className="flex-1 p-6 bg-white">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
