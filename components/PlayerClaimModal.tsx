"use client";

import { useState, useEffect } from "react";
import PlayerCard from "./PlayerCard";

interface Player {
  id: string;
  nhlPlayerId: string;
  name: string;
  team: string | null;
  position: string;
  headshotUrl: string | null;
  teamLogoUrl: string | null;
  jerseyNumber: number | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  isTraded: boolean;
  userId: string | null;
}

interface PlayerClaim {
  id: string;
  status: string;
  createdAt: string;
  player: Player;
}

interface Props {
  onClose: () => void;
}

export default function PlayerClaimModal({ onClose }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [claims, setClaims] = useState<PlayerClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingPlayerId, setClaimingPlayerId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
    fetchClaims();
  }, [searchTerm, position]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("unassigned", "true");
      if (searchTerm) params.append("search", searchTerm);
      if (position) params.append("position", position);

      const response = await fetch(`/api/players?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await fetch("/api/player-claims");
      if (response.ok) {
        const data = await response.json();
        setClaims(data);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  };

  const handleClaimPlayer = async (playerId: string) => {
    setClaimingPlayerId(playerId);
    try {
      const response = await fetch("/api/player-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      if (response.ok) {
        await fetchClaims();
        await fetchPlayers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to claim player");
      }
    } catch (error) {
      console.error("Error claiming player:", error);
      alert("Failed to claim player");
    } finally {
      setClaimingPlayerId(null);
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    try {
      const response = await fetch(`/api/player-claims?id=${claimId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchClaims();
        await fetchPlayers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete claim");
      }
    } catch (error) {
      console.error("Error deleting claim:", error);
      alert("Failed to delete claim");
    }
  };

  const pendingClaims = claims.filter(c => c.status === "pending");
  const approvedClaims = claims.filter(c => c.status === "approved");
  const rejectedClaims = claims.filter(c => c.status === "rejected");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Claim Players</h2>
            <p className="text-sm text-gray-600 mt-1">
              Search for NHL players to add to your team
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* My Claims Section */}
          {claims.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Your Claims</h3>
              <div className="space-y-2">
                {pendingClaims.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-yellow-700 mb-2">Pending ({pendingClaims.length})</p>
                    {pendingClaims.map(claim => (
                      <div key={claim.id} className="flex items-center gap-2 mb-2">
                        <div className="flex-1">
                          <PlayerCard player={claim.player} />
                        </div>
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {approvedClaims.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">Approved ({approvedClaims.length})</p>
                    {approvedClaims.map(claim => (
                      <div key={claim.id} className="mb-2">
                        <PlayerCard player={claim.player} />
                      </div>
                    ))}
                  </div>
                )}
                {rejectedClaims.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2">Rejected ({rejectedClaims.length})</p>
                    {rejectedClaims.map(claim => (
                      <div key={claim.id} className="mb-2">
                        <PlayerCard player={claim.player} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Available Players</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search by name or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All positions</option>
                <option value="C">Center</option>
                <option value="L">Left Wing</option>
                <option value="R">Right Wing</option>
                <option value="D">Defense</option>
                <option value="G">Goalie</option>
              </select>
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-8">Loading players...</p>
            ) : players.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No available players found
              </p>
            ) : (
              players.map((player) => {
                const hasPendingClaim = pendingClaims.some(c => c.player.id === player.id);
                return (
                  <div key={player.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <PlayerCard player={player} />
                    </div>
                    <button
                      onClick={() => handleClaimPlayer(player.id)}
                      disabled={claimingPlayerId === player.id || hasPendingClaim}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        hasPendingClaim
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {claimingPlayerId === player.id
                        ? "Claiming..."
                        : hasPendingClaim
                        ? "Claimed"
                        : "Claim"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Credit */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Player data provided by{" "}
              <a
                href="https://iceanalytics.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                iceanalytics.ca
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
