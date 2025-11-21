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
    draftPick: {
      round: number;
      year: number;
    };
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
    return trade.items
      .filter((item) => item.direction === direction)
      .map((item) => `Round ${item.draftPick.round} (${item.draftPick.year})`)
      .join(", ");
  };

  const trades = activeTab === "received" ? receivedTrades : sentTrades;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("received")}
            className={`pb-3 px-4 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-lg ${
              activeTab === "received"
                ? "border-[#4169E1] text-[#4169E1] bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Received ({receivedTrades.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 px-4 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-lg ${
              activeTab === "sent"
                ? "border-[#4169E1] text-[#4169E1] bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Sent ({sentTrades.length})
            </div>
          </button>
        </div>
      </div>

      {/* Trade List */}
      <div className="space-y-4">
        {trades.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              No {activeTab === "received" ? "received" : "sent"} trades
            </p>
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {activeTab === "received"
                      ? `From: ${trade.fromUser.name || trade.fromUser.email}`
                      : `To: ${trade.toUser.name || trade.toUser.email}`}
                  </p>
                  <p className="text-sm text-gray-500">
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

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 space-y-3 text-sm border border-gray-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-700">They give:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {getTradeItems(trade, "from") || "Nothing"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-700">You give:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {getTradeItems(trade, "to") || "Nothing"}
                    </span>
                  </div>
                </div>
              </div>

              {activeTab === "received" && trade.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleTradeAction(trade.id, "accept")}
                    disabled={processingTradeId === trade.id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleTradeAction(trade.id, "reject")}
                    disabled={processingTradeId === trade.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Reject
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
