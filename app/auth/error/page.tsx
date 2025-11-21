"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "AccessDenied":
        return {
          title: "Access Denied",
          message:
            "Your email address is not authorized to access this league. Please contact your league commissioner to be added to the approved members list.",
        };
      case "Configuration":
        return {
          title: "Configuration Error",
          message:
            "There is a problem with the server configuration. Please contact the administrator.",
        };
      default:
        return {
          title: "Authentication Error",
          message:
            "An error occurred during sign in. Please try again or contact support if the problem persists.",
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {errorInfo.title}
              </h1>
            </div>
          </div>

          <div className="p-8">
            <p className="text-gray-700 text-center mb-6">
              {errorInfo.message}
            </p>

            <Link
              href="/auth/signin"
              className="block w-full bg-gradient-to-r from-[#4169E1] to-[#0047AB] text-white text-center py-3 px-6 rounded-lg font-medium hover:from-[#0047AB] hover:to-[#4169E1] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </Link>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Need help? Contact your league commissioner for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] flex items-center justify-center p-4">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
