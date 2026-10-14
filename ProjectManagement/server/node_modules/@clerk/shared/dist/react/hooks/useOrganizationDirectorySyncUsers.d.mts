import { DirectorySyncResource, DirectorySyncUserResource, GetDirectorySyncUsersParams } from "../../types/directorySync.mjs";

//#region src/react/hooks/useOrganizationDirectorySyncUsers.d.ts
type UseOrganizationDirectorySyncUsersParams = {
  /** The directory to list users for, e.g. `data` from `useOrganizationDirectorySync`. Nothing is fetched while `null` or `undefined`. */directory: DirectorySyncResource | null | undefined;
  /**
   * Pass-through fetch parameters (pagination).
   * Defaults to `{ initialPage: 1, pageSize: 10 }`.
   */
  params?: GetDirectorySyncUsersParams;
  /**
   * Poll the list for changes while `true`. Tie this to the view that needs the
   * live feed so polling stops when that view goes away.
   *
   * @default false
   */
  poll?: boolean;
  /**
   * Polling interval (ms) used while `poll` is `true`.
   *
   * @default 2000
   */
  pollIntervalMs?: number;
  /**
   * If `false`, nothing is fetched and polling is paused.
   *
   * @default true
   */
  enabled?: boolean;
  keepPreviousData?: boolean;
};
type UseOrganizationDirectorySyncUsersReturn = {
  /** `undefined` while loading and while the hook is disabled. */data: DirectorySyncUserResource[] | undefined;
  totalCount: number | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean; /** `true` while the hook is polling. */
  isPolling: boolean;
  /**
   * Force a refetch.
   */
  revalidate: () => Promise<void>;
};
/**
 * The users provisioned into an enterprise connection's Directory Sync
 * directory, most recently touched first. Polling is opt-in via `poll`, which
 * lets the setup flow use the list as a live activity feed.
 *
 * @internal
 */
declare function useOrganizationDirectorySyncUsers(params: UseOrganizationDirectorySyncUsersParams): UseOrganizationDirectorySyncUsersReturn;
//#endregion
export { UseOrganizationDirectorySyncUsersParams, UseOrganizationDirectorySyncUsersReturn, useOrganizationDirectorySyncUsers };
//# sourceMappingURL=useOrganizationDirectorySyncUsers.d.mts.map