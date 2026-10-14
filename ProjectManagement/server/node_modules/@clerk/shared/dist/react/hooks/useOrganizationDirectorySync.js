const require_clerkApiResponseError = require('../../errors/clerkApiResponseError.js');
require('../../error.js');
const require_contexts = require('../contexts.js');
const require_use_clerk_query_client = require('../query/use-clerk-query-client.js');
const require_useQuery = require('../query/useQuery.js');
const require_useClearQueriesOnSignOut = require('./useClearQueriesOnSignOut.js');
const require_useOrganizationBase = require('./base/useOrganizationBase.js');
const require_useOrganizationDirectorySync_shared = require('./useOrganizationDirectorySync.shared.js');
let react = require("react");

//#region src/react/hooks/useOrganizationDirectorySync.tsx
/**
* The Directory Sync directory bound to an enterprise connection of the active organization.
*
* @internal
*/
function useOrganizationDirectorySync(params) {
	const { enterpriseConnectionId, enabled = true } = params;
	const clerk = require_contexts.useClerkInstanceContext();
	const organization = require_useOrganizationBase.useOrganizationBase();
	const [queryClient] = require_use_clerk_query_client.useClerkQueryClient();
	const { queryKey, invalidationKey, stableKey, authenticated } = require_useOrganizationDirectorySync_shared.useOrganizationDirectorySyncCacheKeys({
		organizationId: organization?.id ?? null,
		enterpriseConnectionId
	});
	const queryEnabled = enabled && clerk.loaded && Boolean(organization) && Boolean(enterpriseConnectionId);
	require_useClearQueriesOnSignOut.useClearQueriesOnSignOut({
		isSignedOut: organization === null,
		authenticated,
		stableKeys: stableKey
	});
	const query = require_useQuery.useClerkQuery({
		queryKey,
		queryFn: async () => {
			if (!enterpriseConnectionId) throw new Error("enterpriseConnectionId is required to fetch the directory");
			try {
				return await organization?.getDirectorySync(enterpriseConnectionId) ?? null;
			} catch (err) {
				if (require_clerkApiResponseError.isClerkAPIResponseError(err) && err.status === 404) return null;
				throw err;
			}
		},
		enabled: queryEnabled
	});
	const revalidate = (0, react.useCallback)(() => queryClient.invalidateQueries({ queryKey: invalidationKey }), [queryClient, invalidationKey]);
	const createDirectorySync = (0, react.useCallback)(async (createParams) => {
		if (!enterpriseConnectionId) return;
		const created = await organization?.createDirectorySync(enterpriseConnectionId, createParams);
		await revalidate();
		return created;
	}, [
		organization,
		enterpriseConnectionId,
		revalidate
	]);
	const directory = query.data;
	const updateDirectorySync = (0, react.useCallback)(async (updateParams) => {
		if (!directory) return;
		const updated = await directory.update(updateParams);
		await revalidate();
		return updated;
	}, [directory, revalidate]);
	const rotateDirectorySyncToken = (0, react.useCallback)(async () => {
		if (!directory) return;
		const rotated = await directory.rotateToken();
		await revalidate();
		return rotated;
	}, [directory, revalidate]);
	const setDirectorySyncCredentials = (0, react.useCallback)(async (credentialsParams) => {
		if (!directory) return;
		const updated = await directory.setCredentials(credentialsParams);
		await revalidate();
		return updated;
	}, [directory, revalidate]);
	const syncDirectory = (0, react.useCallback)(async () => {
		if (!directory) return;
		await directory.sync();
	}, [directory]);
	const deleteDirectorySync = (0, react.useCallback)(async () => {
		if (!directory) return;
		const deleted = await directory.delete();
		await revalidate();
		return deleted;
	}, [directory, revalidate]);
	return {
		data: query.data,
		error: query.error ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		createDirectorySync,
		updateDirectorySync,
		rotateDirectorySyncToken,
		setDirectorySyncCredentials,
		syncDirectory,
		deleteDirectorySync,
		revalidate
	};
}

//#endregion
exports.useOrganizationDirectorySync = useOrganizationDirectorySync;