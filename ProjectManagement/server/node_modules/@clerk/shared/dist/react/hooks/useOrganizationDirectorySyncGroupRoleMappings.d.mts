import { RoleResource } from "../../types/role.mjs";
import { DirectorySyncGroupResource, DirectorySyncGroupRoleMappingResource, DirectorySyncResource, ReplaceDirectorySyncGroupRoleMappingsParams } from "../../types/directorySync.mjs";
//#region src/react/hooks/useOrganizationDirectorySyncGroupRoleMappings.d.ts
type UseOrganizationDirectorySyncGroupRoleMappingsParams = {
  /** The directory to read, e.g. `data` from `useOrganizationDirectorySync`. Nothing is fetched while `null` or `undefined`. */directory: DirectorySyncResource | null | undefined;
  /**
   * If `false`, nothing is fetched.
   *
   * @default true
   */
  enabled?: boolean;
};
type DirectorySyncGroupRoleMappingsData = {
  /** Every group the identity provider has pushed. */groups: DirectorySyncGroupResource[]; /** The mappings in priority order. */
  mappings: DirectorySyncGroupRoleMappingResource[]; /** The role members in no mapped group receive. */
  defaultRole: RoleResource | null;
};
type UseOrganizationDirectorySyncGroupRoleMappingsReturn = {
  /** `undefined` while loading and while the hook is disabled. */data: DirectorySyncGroupRoleMappingsData | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean; /** Replaces every mapping and caches the result. */
  replaceGroupRoleMappings: (params: ReplaceDirectorySyncGroupRoleMappingsParams) => Promise<DirectorySyncGroupRoleMappingResource[] | undefined>;
  revalidate: () => Promise<void>;
};
/**
 * The groups a Directory Sync directory has received, its group role mappings, and the organization's
 * default role, loaded together because the mapping editor needs all three.
 *
 * @internal
 */
declare function useOrganizationDirectorySyncGroupRoleMappings(params: UseOrganizationDirectorySyncGroupRoleMappingsParams): UseOrganizationDirectorySyncGroupRoleMappingsReturn;
//#endregion
export { DirectorySyncGroupRoleMappingsData, UseOrganizationDirectorySyncGroupRoleMappingsParams, UseOrganizationDirectorySyncGroupRoleMappingsReturn, useOrganizationDirectorySyncGroupRoleMappings };
//# sourceMappingURL=useOrganizationDirectorySyncGroupRoleMappings.d.mts.map