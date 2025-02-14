import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { useMemo } from "react";
import { useQuery } from "react-query";

/**
 * A hook for querying your custom app data.
 * @desc A thin wrapper around useQuery, ReactQuery's hook for fetching data.
 *
 * @param {Object} options - The options for your query. Accepts the following keys:
 *
 * @param {string} options.url - The URL to query
 * @param {Object} [options.fetchInit] - The init options for fetch
 * @param {Object} [options.reactQueryOptions] - The options for react-query
 *
 * @returns Return value of useQuery - https://react-query.tanstack.com/reference/useQuery.
 */
export function useAppQuery(options) {
  const authenticatedFetch = useAuthenticatedFetch();
  const { url, fetchInit = {}, reactQueryOptions = {} } = options;

  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [url, JSON.stringify(fetchInit)]);

  return useQuery(url, fetch, {
    ...reactQueryOptions,
    refetchOnWindowFocus: false,
  });
}
