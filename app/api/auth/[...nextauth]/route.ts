import { handlers } from "@/lib/auth";

// Force dynamic rendering for auth routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
