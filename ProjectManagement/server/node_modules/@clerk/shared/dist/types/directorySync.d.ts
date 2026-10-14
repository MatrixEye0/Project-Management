import { DeletedObjectResource } from "./deletedObject.js";
import { ClerkPaginatedResponse } from "./pagination.js";
import { ClerkResource } from "./resource.js";
import { RoleResource } from "./role.js";
import { ClerkResourceJSON, RoleJSON } from "./json.js";

//#region src/types/directorySync.d.ts
/**
 * The SCIM provider backing a Directory Sync directory. Derived server-side
 * from the linked enterprise connection's identity provider.
 */
type DirectorySyncProvider = 'okta' | 'entra' | 'custom' | 'google';
interface DirectorySyncJSON extends ClerkResourceJSON {
  object: 'directory';
  name: string;
  enterprise_connection_id: string;
  endpoint_url: string;
  provider: DirectorySyncProvider;
  enabled: boolean;
  group_role_mapping_enabled: boolean;
  attribute_mapping: Record<string, string>;
  /**
   * Whether a validated identity-provider credential is stored for this directory. Only present for
   * pull-based providers; push-based directories authenticate with a bearer token and omit it.
   */
  credentials_configured?: boolean | null;
  /**
   * The SCIM bearer token. Only present on create and rotate responses; it
   * cannot be retrieved again afterwards.
   */
  api_key?: string | null;
  created_at: number;
  updated_at: number;
}
type DirectorySyncJSONSnapshot = Omit<DirectorySyncJSON, 'api_key'> & {
  api_key?: never;
};
interface DirectorySyncResource extends ClerkResource {
  /** The directory ID. */
  id: string;
  /** The display name of the directory. */
  name: string;
  /** The ID of the organization that owns the directory. */
  organizationId: string;
  /** The ID of the enterprise connection the directory provisions through. */
  enterpriseConnectionId: string;
  /** The SCIM 2.0 endpoint URL the identity provider pushes to. */
  endpointUrl: string;
  /** The SCIM provider, derived from the linked enterprise connection. */
  provider: DirectorySyncProvider;
  /** Whether provisioning is active. */
  enabled: boolean;
  /** Whether directory groups are mapped to organization roles. */
  groupRoleMappingEnabled: boolean;
  /** The SCIM attribute paths mapped onto Clerk user attributes. */
  attributeMapping: Record<string, string>;
  /**
   * Whether a validated identity-provider credential is stored for this directory. `null` for
   * push-based providers, which authenticate with a bearer token and have no credential.
   */
  credentialsConfigured: boolean | null;
  /**
   * The SCIM bearer token. Only populated on the resource returned by
   * `Organization.createDirectorySync` and `rotateToken`; `null` everywhere
   * else — generate a new token if it was lost.
   */
  apiKey: string | null;
  /** The date when the directory was created. */
  createdAt: Date | null;
  /** The date when the directory was last updated. */
  updatedAt: Date | null;
  /**
   * Updates the directory, e.g. to activate or deactivate provisioning.
   */
  update: (params: UpdateDirectorySyncParams) => Promise<DirectorySyncResource>;
  /**
   * Mints a new SCIM bearer token, expiring the previous one after a short grace period. The returned resource is
   * the only place the new token is available.
   */
  rotateToken: () => Promise<DirectorySyncResource>;
  /**
   * Deletes the directory and stops provisioning. Previously provisioned members keep their memberships.
   */
  delete: () => Promise<DeletedObjectResource>;
  /**
   * Gets the users the identity provider has provisioned into the directory.
   */
  getUsers: (params?: GetDirectorySyncUsersParams) => Promise<ClerkPaginatedResponse<DirectorySyncUserResource>>;
  /**
   * Stores the credential a pull-based directory reads the identity provider with, and activates the
   * directory once the provider accepts it. Calling it again replaces the stored credential, which is
   * how a rotated key is applied.
   *
   * The credential is validated against the identity provider before it is stored, so a rejected key or
   * a misconfigured delegation rejects with a message describing what to fix. Surface that message: it
   * is the only thing telling the administrator what is wrong with their setup.
   */
  setCredentials: (params: SetDirectorySyncCredentialsParams) => Promise<DirectorySyncResource>;
  /**
   * Starts a sync for a pull-based directory instead of waiting for the next scheduled one. Rejects
   * while a sync is already running.
   */
  sync: () => Promise<void>;
  /**
   * Gets the result of the directory's most recent sync. Every field is `null` before the first sync
   * completes.
   */
  getSyncStatus: () => Promise<DirectorySyncStatusResource>;
  /**
   * Gets a page of the groups the identity provider has pushed into the directory.
   */
  getGroups: (params?: GetDirectorySyncGroupsParams) => Promise<DirectorySyncGroupsPage>;
  /**
   * Gets the group role mappings in priority order, together with the organization's default role.
   */
  getGroupRoleMappings: () => Promise<DirectorySyncGroupRoleMappingsResource>;
  /**
   * Replaces every group role mapping. The list order is the priority, and a group left out is unmapped.
   * Members' roles are reassigned in the background.
   */
  replaceGroupRoleMappings: (params: ReplaceDirectorySyncGroupRoleMappingsParams) => Promise<DirectorySyncGroupRoleMappingsResource>;
  __internal_toSnapshot: () => DirectorySyncJSONSnapshot;
}
interface DirectorySyncUserJSON extends ClerkResourceJSON {
  object: 'directory_user';
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  identifier: string | null;
  image_url: string;
  has_image: boolean;
  active: boolean;
  provisioned_at: number;
  updated_at: number;
}
/**
 * A user the identity provider has provisioned into the directory. Carries the same identifying fields as
 * `PublicUserData`.
 */
interface DirectorySyncUserResource extends ClerkResource {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  /** The user's primary email address. */
  identifier: string | null;
  imageUrl: string;
  hasImage: boolean;
  /** `false` if the identity provider has deprovisioned the user. */
  active: boolean;
  /** The date the user was provisioned into the directory. */
  provisionedAt: Date | null;
  updatedAt: Date | null;
}
type UpdateDirectorySyncParams = {
  /** Activates (`true`) or deactivates (`false`) provisioning. */enabled?: boolean; /** Partial attribute mapping to merge into the stored one; `null` values remove keys. */
  attributeMapping?: Record<string, string | null>; /** Turns group role mapping on (`true`) or off (`false`). */
  groupRoleMappingEnabled?: boolean;
};
type CreateDirectorySyncParams = {
  /** Optional display name; defaults to the enterprise connection's name. */name?: string;
};
type GetDirectorySyncUsersParams = {
  initialPage?: number;
  pageSize?: number;
};
/**
 * The outcome of a directory's last sync run.
 */
type DirectorySyncRunStatus = 'running' | 'succeeded' | 'failed' | 'cancelled';
interface DirectorySyncStatusJSON {
  last_synced_at: number | null;
  last_sync_status: DirectorySyncRunStatus | null;
  last_sync_error: string | null;
  last_sync_changed_user_count?: number | null;
}
interface DirectorySyncStatusResource {
  /** When the last sync finished, or `null` if none has completed. */
  lastSyncedAt: Date | null;
  /** The outcome of the last sync, or `null` if none has completed. */
  lastSyncStatus: DirectorySyncRunStatus | null;
  /** Why the last sync failed, when it did. */
  lastSyncError: string | null;
  /**
   * How many users the last sync created or updated, or `null` when none has
   * completed. Those users are provisioned after the sync itself finishes, so
   * a count above zero means more are still on their way.
   */
  lastSyncChangedUserCount: number | null;
}
type SetDirectorySyncCredentialsParams = {
  /** The service account key, as the JSON document downloaded from the identity provider. */serviceAccountJson: string; /** The directory administrator the service account impersonates when reading the directory. */
  subjectEmail: string;
};
interface DirectorySyncGroupJSON {
  object: 'directory_group';
  id: string;
  display_name: string;
  updated_at: number;
}
interface DirectorySyncGroupResource {
  id: string;
  /** The group's name as the identity provider pushed it. */
  displayName: string;
  updatedAt: Date | null;
}
interface DirectorySyncGroupsPageJSON {
  data: DirectorySyncGroupJSON[];
  cursor: {
    starting_after: string | null;
    ending_before: string | null;
    has_next_page: boolean;
  };
}
interface DirectorySyncGroupsPage {
  data: DirectorySyncGroupResource[];
  /** Pass as `startingAfter` to fetch the next page; `null` on the last page. */
  startingAfter: string | null;
  hasNextPage: boolean;
}
type GetDirectorySyncGroupsParams = {
  /** At most 500. */limit?: number;
  startingAfter?: string;
};
interface DirectorySyncGroupRoleMappingJSON {
  object: 'directory_group_role_mapping';
  id: string;
  directory_id: string;
  directory_group_id: string;
  directory_group_display_name: string;
  role?: RoleJSON | null;
  precedence: number;
  created_at: number;
  updated_at: number;
}
interface DirectorySyncGroupRoleMappingResource {
  id: string;
  directoryGroupId: string;
  directoryGroupDisplayName: string;
  /** `null` if the mapped role no longer exists. */
  role: RoleResource | null;
  /** 1 is the highest priority. */
  precedence: number;
}
interface DirectorySyncGroupRoleMappingsJSON {
  data: DirectorySyncGroupRoleMappingJSON[];
  total_count: number;
  default_role: RoleJSON | null;
}
interface DirectorySyncGroupRoleMappingsResource {
  /** The mappings in priority order. */
  data: DirectorySyncGroupRoleMappingResource[];
  /** The role members in no mapped group receive. It cannot be changed through the directory. */
  defaultRole: RoleResource | null;
}
type ReplaceDirectorySyncGroupRoleMappingsParams = {
  /** In priority order. `role` is an organization role key, such as `org:admin`. At most 100 entries. */mappings: {
    directoryGroupId: string;
    role: string;
  }[];
};
//#endregion
export { CreateDirectorySyncParams, DirectorySyncGroupJSON, DirectorySyncGroupResource, DirectorySyncGroupRoleMappingJSON, DirectorySyncGroupRoleMappingResource, DirectorySyncGroupRoleMappingsJSON, DirectorySyncGroupRoleMappingsResource, DirectorySyncGroupsPage, DirectorySyncGroupsPageJSON, DirectorySyncJSON, DirectorySyncJSONSnapshot, DirectorySyncProvider, DirectorySyncResource, DirectorySyncRunStatus, DirectorySyncStatusJSON, DirectorySyncStatusResource, DirectorySyncUserJSON, DirectorySyncUserResource, GetDirectorySyncGroupsParams, GetDirectorySyncUsersParams, ReplaceDirectorySyncGroupRoleMappingsParams, SetDirectorySyncCredentialsParams, UpdateDirectorySyncParams };
//# sourceMappingURL=directorySync.d.ts.map