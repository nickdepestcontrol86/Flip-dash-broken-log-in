import { useQuery } from "convex/react";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";
import { useState, useEffect } from "react";

/**
 * A safe wrapper around useQuery that catches Convex server errors
 * and returns null instead of crashing the app.
 * 
 * This is needed because some Convex queries (like auth:getCurrentUser)
 * can throw server errors that propagate to the client and crash React.
 */
export function useSafeQuery<F extends FunctionReference<"query">>(
  query: F,
  args: FunctionArgs<F> | "skip"
): FunctionReturnType<F> | undefined | null {
  const [hasError, setHasError] = useState(false);

  // Reset error state when args change
  useEffect(() => {
    setHasError(false);
  }, [JSON.stringify(args)]);

  try {
    const result = useQuery(query, args);
    if (hasError) setHasError(false);
    return result;
  } catch {
    if (!hasError) setHasError(true);
    return null;
  }
}
