import { DeletedObjectResource } from "../../types/deletedObject.js";
import { CreateDirectorySyncParams, DirectorySyncResource, SetDirectorySyncCredentialsParams, UpdateDirectorySyncParams } from "../../types/directorySync.js";

//#region src/react/hooks/useOrganizationDirectorySync.d.ts
type UseOrganizationDirectorySyncParams = {
  enterpriseConnectionId: string | null;
  enabled?: boolean;
};
type UseOrganizationDirectorySyncReturn = {
  /** The connection's directory, `null` when none has been created yet, `undefined` while loading. */data: DirectorySyncResource | null | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  createDirectorySync: (params?: CreateDirectorySyncParams) => Promise<DirectorySyncResource | undefined>; /** Resolves `undefined` until `data` has loaded, since the mutations act on the loaded directory. */
  updateDirectorySync: (params: UpdateDirectorySyncParams) => Promise<DirectorySyncResource | undefined>;
  rotateDirectorySyncToken: () => Promise<DirectorySyncResource | undefined>;
  /**
   * Stores the credential a pull-based directory reads the identity provider with, activating it.
   * Rejects with the provider's own validation message when the credential is refused; surface that
   * message, it is what tells the admin how to fix their setup.
   */
  setDirectorySyncCredentials: (params: SetDirectorySyncCredentialsParams) => Promise<DirectorySyncResource | undefined>; /** Starts a sync for a pull-based directory rather than waiting for the next scheduled one. */
  syncDirectory: () => Promise<void>;
  deleteDirectorySync: () => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
};
/**
 * The Directory Sync directory bound to an enterprise connection of the active organization.
 *
 * @internal
 */
declare function useOrganizationDirectorySync(params: UseOrganizationDirectorySyncParams): UseOrganizationDirectorySyncReturn;
//#endregion
export { UseOrganizationDirectorySyncParams, UseOrganizationDirectorySyncReturn, useOrganizationDirectorySync };
//# sourceMappingURL=useOrganizationDirectorySync.d.ts.map