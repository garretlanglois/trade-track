"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface DraftPick {
  id: string;
  round: number;
  year: number;
  isTraded: boolean;
  userId: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  draftPicks: DraftPick[];
}

interface AllowedEmail {
  email: string;
  createdAt: string;
}

interface Trade {
  id: string;
  status: string;
  createdAt: string;
  fromUser: {
    id: string;
    name: string | null;
    email: string;
  };
  toUser: {
    id: string;
    name: string | null;
    email: string;
  };
  items: Array<{
    direction: string;
    draftPick: {
      round: number;
      year: number;
    };
  }>;
}

interface Props {
  users: User[];
  allowedEmails: AllowedEmail[];
  trades: Trade[];
}

export default function AdminClient({ users, allowedEmails, trades }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "emails" | "trades">("users");
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPickRound, setNewPickRound] = useState("");
  const [newPickYear, setNewPickYear] = useState(new Date().getFullYear().toString());

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setNewEmail("");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmail = async (email: string) => {
    if (!confirm(`Remove ${email} from allowed emails?`)) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    if (!confirm("Cancel this trade? If accepted, picks will be reversed.")) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/trades", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newPickRound || !newPickYear) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          round: parseInt(newPickRound),
          year: parseInt(newPickYear),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setNewPickRound("");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePick = async (pickId: string) => {
    if (!confirm("Delete this draft pick?")) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/picks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This will remove all their picks and trades.`)) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Allowed Emails</p>
            <p className="text-3xl font-bold text-gray-900">{allowedEmails.length}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Trades</p>
            <p className="text-3xl font-bold text-gray-900">{trades.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Users & Picks
            </button>
            <button
              onClick={() => setActiveTab("emails")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "emails"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Allowed Emails
            </button>
            <button
              onClick={() => setActiveTab("trades")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "trades"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              All Trades
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Add Pick Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Add Draft Pick</h3>
              <form onSubmit={handleAddPick} className="grid sm:grid-cols-4 gap-4">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  required
                >
                  <option value="">Select user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Round"
                  min="1"
                  max="10"
                  value={newPickRound}
                  onChange={(e) => setNewPickRound(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  required
                />
                <input
                  type="number"
                  placeholder="Year"
                  min="2024"
                  max="2030"
                  value={newPickYear}
                  onChange={(e) => setNewPickYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Add Pick
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        disabled={isLoading || user.email === "gaslanglois@gmail.com"}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete User
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {user.draftPicks.map((pick) => (
                        <div key={pick.id} className="border border-gray-300 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Round {pick.round}</p>
                            <p className="text-xs text-gray-600">{pick.year}</p>
                          </div>
                          <button
                            onClick={() => handleDeletePick(pick.id)}
                            disabled={isLoading}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emails Tab */}
        {activeTab === "emails" && (
          <div className="space-y-6">
            {/* Add Email Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Add Allowed Email</h3>
              <form onSubmit={handleAddEmail} className="flex gap-4">
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Add Email
                </button>
              </form>
            </div>

            {/* Emails List */}
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
              {allowedEmails.map((item) => (
                <div key={item.email} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.email}</p>
                    <p className="text-xs text-gray-500">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEmail(item.email)}
                    disabled={isLoading || item.email === "gaslanglois@gmail.com"}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === "trades" && (
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      {trade.fromUser.name || trade.fromUser.email} → {trade.toUser.name || trade.toUser.email}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(trade.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded border text-xs font-medium ${
                        trade.status === "accepted"
                          ? "bg-green-100 text-green-900 border-green-200"
                          : trade.status === "pending"
                          ? "bg-yellow-100 text-yellow-900 border-yellow-200"
                          : "bg-red-100 text-red-900 border-red-200"
                      }`}
                    >
                      {trade.status}
                    </span>
                    <button
                      onClick={() => handleCancelTrade(trade.id)}
                      disabled={isLoading}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">From gives: </span>
                    <span className="text-gray-900">
                      {trade.items
                        .filter((i) => i.direction === "from")
                        .map((i) => `Round ${i.draftPick.round} (${i.draftPick.year})`)
                        .join(", ") || "Nothing"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To gives: </span>
                    <span className="text-gray-900">
                      {trade.items
                        .filter((i) => i.direction === "to")
                        .map((i) => `Round ${i.draftPick.round} (${i.draftPick.year})`)
                        .join(", ") || "Nothing"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {trades.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600">No trades yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
