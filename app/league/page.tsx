import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function LeaguePage() {
  const session = await getSession();

  if (!session?.email) {
    redirect("/auth/signin");
  }

  const allUsers = await prisma.user.findMany({
    include: {
      draftPicks: {
        orderBy: { round: "asc" },
      },
      sentTrades: {
        where: { status: "accepted" },
      },
      receivedTrades: {
        where: { status: "accepted" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">League</span>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* League Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">League overview</h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Members</p>
              <p className="text-3xl font-bold text-gray-900">{allUsers.length}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total picks</p>
              <p className="text-3xl font-bold text-gray-900">
                {allUsers.reduce((sum, user) => sum + user.draftPicks.length, 0)}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Completed trades</p>
              <p className="text-3xl font-bold text-gray-900">
                {allUsers.reduce((sum, user) => sum + user.sentTrades.length + user.receivedTrades.length, 0) / 2}
              </p>
            </div>
          </div>
        </div>

        {/* League Members */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Members & picks</h2>

          <div className="space-y-4">
            {allUsers.map((user) => {
              const activePicks = user.draftPicks.filter((p) => !p.isTraded);

              return (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {user.image && (
                          <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={40}
                            height={40}
                            className="rounded-full border border-gray-200"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {user.name || user.email}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Active picks</p>
                        <p className="text-2xl font-bold text-gray-900">{activePicks.length}</p>
                      </div>
                    </div>

                    {/* Draft Picks Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {user.draftPicks.map((pick) => (
                        <div
                          key={pick.id}
                          className={`border rounded-lg p-3 ${
                            pick.isTraded
                              ? "border-gray-200 bg-gray-50"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          <p className="font-semibold text-gray-900 text-sm">Round {pick.round}</p>
                          <p className="text-xs text-gray-600">{pick.year}</p>
                          {pick.isTraded && (
                            <span className="inline-block mt-1 text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                              Traded
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
