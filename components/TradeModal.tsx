"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
}

interface OtherUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Props {
  currentUser: User;
  allUsers: OtherUser[];
  onClose: () => void;
}

export default function TradeModal({ currentUser, allUsers, onClose }: Props) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [myPicks, setMyPicks] = useState<string[]>([]);
  const [theirPicks, setTheirPicks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availableMyPicks = currentUser.draftPicks.filter((p) => !p.isTraded);

  const handleSubmit = async () => {
    if (!selectedUser || myPicks.length === 0) {
      setError("Please select a trade partner and at least one of your picks");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: selectedUser,
          myPickIds: myPicks,
          theirPickIds: theirPicks,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create trade");
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMyPick = (pickId: string) => {
    setMyPicks((prev) =>
      prev.includes(pickId) ? prev.filter((id) => id !== pickId) : [...prev, pickId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#4169E1] to-[#0047AB] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Propose Trade</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Select Trade Partner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trade Partner
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4169E1] focus:outline-none"
            >
              <option value="">Select a league member...</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Your Picks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Picks to Trade
            </label>
            <div className="space-y-2">
              {availableMyPicks.map((pick) => (
                <label
                  key={pick.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    myPicks.includes(pick.id)
                      ? "border-[#4169E1] bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={myPicks.includes(pick.id)}
                    onChange={() => toggleMyPick(pick.id)}
                    className="w-5 h-5 text-[#4169E1] rounded focus:ring-[#4169E1]"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Round {pick.round} Pick
                    </p>
                    <p className="text-sm text-gray-600">{pick.year} Draft</p>
                  </div>
                </label>
              ))}
              {availableMyPicks.length === 0 && (
                <p className="text-gray-500 text-sm italic py-4 text-center">
                  You have no available picks to trade
                </p>
              )}
            </div>
          </div>

          {/* Trade Details */}
          {myPicks.length > 0 && selectedUser && (
            <div className="bg-blue-50 border-2 border-[#4169E1] rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Trade Summary</h3>
              <div className="text-sm space-y-1">
                <p className="text-gray-700">
                  <span className="font-medium">You give:</span> {myPicks.length} pick
                  {myPicks.length > 1 ? "s" : ""}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">To:</span>{" "}
                  {allUsers.find((u) => u.id === selectedUser)?.name ||
                    allUsers.find((u) => u.id === selectedUser)?.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUser || myPicks.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4169E1] to-[#0047AB] text-white rounded-lg font-medium hover:from-[#0047AB] hover:to-[#4169E1] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Proposing..." : "Propose Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}
