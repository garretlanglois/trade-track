"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import TradeModal from "./TradeModal";
import TradeList from "./TradeList";

interface DraftPick {
  id: string;
  round: number;
  year: number;
  isTraded: boolean;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  draftPicks: DraftPick[];
  sentTrades: any[];
  receivedTrades: any[];
}

interface OtherUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Props {
  user: User;
  allUsers: OtherUser[];
}

export default function DashboardClient({ user, allUsers }: Props) {
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const pendingReceivedTrades = user.receivedTrades.filter(
    (t) => t.status === "pending"
  );
  const pendingSentTrades = user.sentTrades.filter((t) => t.status === "pending");
  const acceptedTrades = [...user.sentTrades, ...user.receivedTrades].filter(
    (t) => t.status === "accepted"
  );
  const activePicks = user.draftPicks.filter((p) => !p.isTraded);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header - Modern Glassmorphism Style */}
      <header className="bg-gradient-to-r from-[#4169E1] via-[#5B7FE8] to-[#0047AB] shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2">
                <svg
                  className="w-6 h-6 text-[#4169E1]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Draft Trade Tracker</h1>
                <p className="text-xs text-blue-100">Hockey Fantasy League</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/league"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">League</span>
              </Link>
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-white"
                />
              )}
              <span className="text-white font-medium hidden md:inline">
                {user.name || user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Active Picks */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Picks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activePicks.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Offers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Offers</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingReceivedTrades.length}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed Trades */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{acceptedTrades.length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Trades Sent */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trades Sent</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{user.sentTrades.length}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {pendingReceivedTrades.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-md animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 font-semibold">
                  You have {pendingReceivedTrades.length} pending trade offer
                  {pendingReceivedTrades.length > 1 ? "s" : ""} to review
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Your Draft Picks */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 px-6 py-4 border-b border-gray-600">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Your Draft Picks
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {user.draftPicks.map((pick, index) => (
                  <div
                    key={pick.id}
                    className={`border-2 rounded-xl p-4 transition-all duration-300 hover:scale-105 ${
                      pick.isTraded
                        ? "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100"
                        : "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          pick.isTraded ? "bg-gray-300 text-gray-600" : "bg-blue-500 text-white"
                        }`}>
                          {pick.round}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            Round {pick.round}
                          </p>
                          <p className="text-sm text-gray-600">{pick.year} Draft</p>
                        </div>
                      </div>
                      {pick.isTraded && (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
                          Traded
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setIsTradeModalOpen(true)}
                  className="w-full mt-4 bg-gradient-to-r from-[#4169E1] via-[#5B7FE8] to-[#0047AB] text-white py-3 px-4 rounded-xl font-semibold hover:from-[#0047AB] hover:to-[#4169E1] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Propose New Trade
                </button>
              </div>
            </div>
          </div>

          {/* Trade Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 px-6 py-4 border-b border-gray-600">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Trade Activity
                </h2>
              </div>
              <div className="p-6">
                <TradeList
                  sentTrades={user.sentTrades}
                  receivedTrades={user.receivedTrades}
                  userId={user.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTradeModalOpen && (
        <TradeModal
          currentUser={user}
          allUsers={allUsers}
          onClose={() => setIsTradeModalOpen(false)}
        />
      )}
    </div>
  );
}
