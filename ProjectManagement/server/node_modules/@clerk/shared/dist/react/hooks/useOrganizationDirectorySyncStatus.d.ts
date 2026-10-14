import { DirectorySyncResource, DirectorySyncStatusResource } from "../../types/directorySync.js";

//#region src/react/hooks/useOrganizationDirectorySyncStatus.d.ts
type UseOrganizationDirectorySyncStatusParams = {
  /** The directory to read status for, e.g. `data` from `useOrganizationDirectorySync`. Nothing is fetched while `null` or `undefined`. */directory: DirectorySyncResource | null | undefined;
  /**
   * Poll for changes while `true`. Tie this to the view that needs the live
   * status so polling stops when that view goes away.
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
};
type UseOrganizationDirectorySyncStatusReturn = {
  /** `undefined` while loading and while the hook is disabled. Every field is `null` before the first sync completes. */data: DirectorySyncStatusResource | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean; /** `true` while the hook is polling. */
  isPolling: boolean;
  revalidate: () => Promise<void>;
};
/**
 * The result of a Directory Sync directory's most recent sync.
 *
 * Only pull-based directories sync, so this stays dormant for push providers,
 * which are driven by the identity provider and have no sync to report.
 *
 * @internal
 */
declare function useOrganizationDirectorySyncStatus(params: UseOrganizationDirectorySyncStatusParams): UseOrganizationDirectorySyncStatusReturn;
//#endregion
export { UseOrganizationDirectorySyncStatusParams, UseOrganizationDirectorySyncStatusReturn, useOrganizationDirectorySyncStatus };
//# sourceMappingURL=useOrganizationDirectorySyncStatus.d.ts.map