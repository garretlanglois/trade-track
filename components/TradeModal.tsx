"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
          theirPickIds: [],
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
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Propose trade</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* Select Trade Partner */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Trade partner
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="">Select a member...</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Your Picks */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Your picks to trade
            </label>
            <div className="space-y-2">
              {availableMyPicks.map((pick) => (
                <label
                  key={pick.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    myPicks.includes(pick.id)
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={myPicks.includes(pick.id)}
                    onChange={() => toggleMyPick(pick.id)}
                    className="w-4 h-4 text-gray-900 rounded focus:ring-gray-900"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Round {pick.round}
                    </p>
                    <p className="text-sm text-gray-600">{pick.year}</p>
                  </div>
                </label>
              ))}
              {availableMyPicks.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">
                  You have no available picks to trade
                </p>
              )}
            </div>
          </div>

          {/* Trade Summary */}
          {myPicks.length > 0 && selectedUser && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUser || myPicks.length === 0}
            className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Propose trade"}
          </button>
        </div>
      </div>
    </div>
  );
}
