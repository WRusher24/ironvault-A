import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/db/schema";

/**
 * Require an authenticated user for an API route.
 * Returns the user, or a ready-to-return 401 response.
 */
export async function requireUser(): Promise<
  { user: User; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Please log in first" },
        { status: 401 },
      ),
    };
  }
  return { user };
}
