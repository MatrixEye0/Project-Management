const require_contexts = require('../contexts.js');
const require_use_clerk_query_client = require('../query/use-clerk-query-client.js');
const require_useQuery = require('../query/useQuery.js');
const require_useClearQueriesOnSignOut = require('./useClearQueriesOnSignOut.js');
const require_useOrganizationBase = require('./base/useOrganizationBase.js');
const require_useOrganizationDirectorySync_shared = require('./useOrganizationDirectorySync.shared.js');
let react = require("react");

//#region src/react/hooks/useOrganizationDirectorySyncUsers.tsx
const DEFAULT_POLL_INTERVAL_MS = 2e3;
/**
* The users provisioned into an enterprise connection's Directory Sync
* directory, most recently touched first. Polling is opt-in via `poll`, which
* lets the setup flow use the list as a live activity feed.
*
* @internal
*/
function useOrganizationDirectorySyncUsers(params) {
	const { directory, params: fetchParams = {
		initialPage: 1,
		pageSize: 10
	}, poll = false, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS, enabled = true, keepPreviousData = true } = params;
	const clerk = require_contexts.useClerkInstanceContext();
	const organization = require_useOrganizationBase.useOrganizationBase();
	const [queryClient] = require_use_clerk_query_client.useClerkQueryClient();
	const enterpriseConnectionId = directory?.enterpriseConnectionId ?? null;
	const directoryId = directory?.id ?? null;
	const { queryKey, invalidationKey, stableKey, authenticated } = require_useOrganizationDirectorySync_shared.useOrganizationDirectorySyncUsersCacheKeys({
		organizationId: organization?.id ?? null,
		enterpriseConnectionId,
		directoryId,
		args: fetchParams
	});
	require_useClearQueriesOnSignOut.useClearQueriesOnSignOut({
		isSignedOut: organization === null,
		authenticated,
		stableKeys: stableKey
	});
	const queryEnabled = enabled && clerk.loaded && Boolean(organization) && Boolean(directory);
	const currentTracked = queryKey[2];
	const query = require_useQuery.useClerkQuery({
		queryKey,
		queryFn: () => {
			if (!directory) throw new Error("directory is required to fetch directory users");
			return directory.getUsers(fetchParams);
		},
		refetchInterval: () => poll ? pollIntervalMs : false,
		enabled: queryEnabled,
		refetchIntervalInBackground: false,
		placeholderData: keepPreviousData ? (previousData, previousQuery) => {
			const previousTracked = previousQuery?.queryKey[2];
			return Boolean(currentTracked.organizationId) && Boolean(currentTracked.directoryId) && previousTracked?.organizationId === currentTracked.organizationId && previousTracked?.directoryId === currentTracked.directoryId ? previousData : void 0;
		} : void 0
	});
	const revalidate = (0, react.useCallback)(async () => {
		await queryClient.invalidateQueries({ queryKey: invalidationKey });
	}, [queryClient, invalidationKey]);
	const isPolling = queryEnabled && poll;
	return {
		data: queryEnabled ? query.data?.data : void 0,
		totalCount: queryEnabled ? query.data?.total_count : void 0,
		error: query.error ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isPolling,
		revalidate
	};
}

//#endregion
exports.useOrganizationDirectorySyncUsers = useOrganizationDirectorySyncUsers;