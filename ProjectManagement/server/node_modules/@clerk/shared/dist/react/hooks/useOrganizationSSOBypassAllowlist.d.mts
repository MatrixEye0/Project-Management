import { DeletedObjectResource } from "../../types/deletedObject.mjs";
import { AddSSOBypassAllowlistUserParams, AddSSOBypassAllowlistUsersParams, SSOBypassAllowlistBulkCreateResult, SSOBypassAllowlistUserResource } from "../../types/ssoBypassAllowlist.mjs";

//#region src/react/hooks/useOrganizationSSOBypassAllowlist.d.ts
type UseOrganizationSSOBypassAllowlistParams = {
  enabled?: boolean;
  keepPreviousData?: boolean;
};
type UseOrganizationSSOBypassAllowlistReturn = {
  data: SSOBypassAllowlistUserResource[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  addUser: (params: AddSSOBypassAllowlistUserParams) => Promise<SSOBypassAllowlistUserResource | undefined>;
  addUsers: (params: AddSSOBypassAllowlistUsersParams) => Promise<SSOBypassAllowlistBulkCreateResult | undefined>;
  removeUser: (userId: string) => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
};
/**
 * The SSO bypass allowlist of the active organization
 *
 * @internal
 */
declare function useOrganizationSSOBypassAllowlist(params?: UseOrganizationSSOBypassAllowlistParams): UseOrganizationSSOBypassAllowlistReturn;
//#endregion
export { UseOrganizationSSOBypassAllowlistParams, UseOrganizationSSOBypassAllowlistReturn, useOrganizationSSOBypassAllowlist };
//# sourceMappingURL=useOrganizationSSOBypassAllowlist.d.mts.map