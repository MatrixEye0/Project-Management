import { DeletedObjectResource } from "./deletedObject.mjs";
import { PublicUserData } from "./session.mjs";
import { PublicUserDataJSON } from "./json.mjs";

//#region src/types/ssoBypassAllowlist.d.ts
interface SSOBypassAllowlistUserJSON {
  object: 'sso_bypass_allowlist_user';
  user_id: string;
  public_user_data: PublicUserDataJSON;
  created_at: number;
  updated_at: number;
}
type SSOBypassAllowlistUserJSONSnapshot = SSOBypassAllowlistUserJSON;
interface SSOBypassAllowlistUserResource {
  id: string;
  userId: string;
  publicUserData: PublicUserData;
  createdAt: Date;
  updatedAt: Date;
  __internal_toSnapshot: () => SSOBypassAllowlistUserJSONSnapshot;
}
type AddSSOBypassAllowlistUserParams = {
  userId: string;
};
type AddSSOBypassAllowlistUsersParams = {
  userIds: string[];
};
interface SSOBypassAllowlistBulkCreateErrorJSON {
  user_id: string;
  code: string;
}
interface SSOBypassAllowlistBulkCreateJSON {
  data: SSOBypassAllowlistUserJSON[];
  errors: SSOBypassAllowlistBulkCreateErrorJSON[];
}
interface SSOBypassAllowlistBulkCreateError {
  userId: string;
  code: string;
}
interface SSOBypassAllowlistBulkCreateResult {
  data: SSOBypassAllowlistUserResource[];
  errors: SSOBypassAllowlistBulkCreateError[];
}
/** @generateWithEmptyComment */
interface SSOBypassAllowlistResource {
  /**
   * Lists the members who may sign in with an email code when the organization's enterprise SSO is unavailable.
   * Requires the `org:sys_entconns_sso_bypass:manage` permission.
   */
  getUsers: () => Promise<SSOBypassAllowlistUserResource[]>;
  /**
   * Adds a member to the allowlist. The member must hold a verified email address served by one of the
   * organization's enterprise connections.
   */
  addUser: (params: AddSSOBypassAllowlistUserParams) => Promise<SSOBypassAllowlistUserResource>;
  /**
   * Adds several members to the allowlist, one request per 100 ids. Members who cannot be added are reported in
   * `errors` with the same code `addUser` returns for them, and do not fail the batch.
   */
  addUsers: (params: AddSSOBypassAllowlistUsersParams) => Promise<SSOBypassAllowlistBulkCreateResult>;
  /**
   * Removes a member from the allowlist.
   */
  removeUser: (userId: string) => Promise<DeletedObjectResource>;
}
//#endregion
export { AddSSOBypassAllowlistUserParams, AddSSOBypassAllowlistUsersParams, SSOBypassAllowlistBulkCreateError, SSOBypassAllowlistBulkCreateErrorJSON, SSOBypassAllowlistBulkCreateJSON, SSOBypassAllowlistBulkCreateResult, SSOBypassAllowlistResource, SSOBypassAllowlistUserJSON, SSOBypassAllowlistUserJSONSnapshot, SSOBypassAllowlistUserResource };
//# sourceMappingURL=ssoBypassAllowlist.d.mts.map