"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Trade {
  id: string;
  status: string;
  createdAt: string;
  fromUser: {
    name: string | null;
    email: string;
  };
  toUser: {
    name: string | null;
    email: string;
  };
  items: Array<{
    direction: string;
    draftPick?: {
      round: number;
      year: number;
    } | null;
    player?: {
      name: string;
      position: string;
      team: string | null;
    } | null;
  }>;
}

interface Props {
  sentTrades: Trade[];
  receivedTrades: Trade[];
  userId: string;
}

export default function TradeList({ sentTrades, receivedTrades, userId }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [processingTradeId, setProcessingTradeId] = useState<string | null>(null);

  const handleTradeAction = async (tradeId: string, action: "accept" | "reject") => {
    setProcessingTradeId(tradeId);

    try {
      const response = await fetch("/api/trades", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tradeId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update trade");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating trade:", error);
      alert("Failed to update trade. Please try again.");
    } finally {
      setProcessingTradeId(null);
    }
  };

  const getTradeItems = (trade: Trade, direction: "from" | "to") => {
    const items = trade.items
      .filter((item) => item.direction === direction)
      .map((item) => {
        if (item.draftPick) {
          return `Round ${item.draftPick.round} (${item.draftPick.year})`;
        } else if (item.player) {
          return `${item.player.name} (${item.player.position}${item.player.team ? ` - ${item.player.team}` : ''})`;
        }
        return null;
      })
      .filter(Boolean);

    return items.length > 0 ? items.join(", ") : "Nothing";
  };

  const trades = activeTab === "received" ? receivedTrades : sentTrades;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-900 border-yellow-200",
      accepted: "bg-green-100 text-green-900 border-green-200",
      rejected: "bg-red-100 text-red-900 border-red-200",
      cancelled: "bg-gray-100 text-gray-900 border-gray-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded border text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("received")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "received"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Received ({receivedTrades.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "sent"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Sent ({sentTrades.length})
          </button>
        </div>
      </div>

      {/* Trade List */}
      <div className="space-y-4">
        {trades.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              No {activeTab === "received" ? "received" : "sent"} trades
            </p>
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    {activeTab === "received"
                      ? `From: ${trade.fromUser.name || trade.fromUser.email}`
                      : `To: ${trade.toUser.name || trade.toUser.email}`}
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
                {getStatusBadge(trade.status)}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">They give: </span>
                  <span className="text-gray-900">
                    {getTradeItems(trade, "from")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">You give: </span>
                  <span className="text-gray-900">
                    {getTradeItems(trade, "to")}
                  </span>
                </div>
              </div>

              {activeTab === "received" && trade.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleTradeAction(trade.id, "accept")}
                    disabled={processingTradeId === trade.id}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleTradeAction(trade.id, "reject")}
                    disabled={processingTradeId === trade.id}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
