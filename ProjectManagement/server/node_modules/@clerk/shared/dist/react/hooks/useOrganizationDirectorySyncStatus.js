const require_contexts = require('../contexts.js');
const require_use_clerk_query_client = require('../query/use-clerk-query-client.js');
const require_useQuery = require('../query/useQuery.js');
const require_useClearQueriesOnSignOut = require('./useClearQueriesOnSignOut.js');
const require_useOrganizationBase = require('./base/useOrganizationBase.js');
const require_useOrganizationDirectorySync_shared = require('./useOrganizationDirectorySync.shared.js');
let react = require("react");

//#region src/react/hooks/useOrganizationDirectorySyncStatus.tsx
const DEFAULT_POLL_INTERVAL_MS = 2e3;
/**
* The result of a Directory Sync directory's most recent sync.
*
* Only pull-based directories sync, so this stays dormant for push providers,
* which are driven by the identity provider and have no sync to report.
*
* @internal
*/
function useOrganizationDirectorySyncStatus(params) {
	const { directory, poll = false, pollIntervalMs = DEFAULT_POLL_INTERVAL_MS, enabled = true } = params;
	const clerk = require_contexts.useClerkInstanceContext();
	const organization = require_useOrganizationBase.useOrganizationBase();
	const [queryClient] = require_use_clerk_query_client.useClerkQueryClient();
	const enterpriseConnectionId = directory?.enterpriseConnectionId ?? null;
	const directoryId = directory?.id ?? null;
	const { queryKey, invalidationKey, stableKey, authenticated } = require_useOrganizationDirectorySync_shared.useOrganizationDirectorySyncStatusCacheKeys({
		organizationId: organization?.id ?? null,
		enterpriseConnectionId,
		directoryId
	});
	require_useClearQueriesOnSignOut.useClearQueriesOnSignOut({
		isSignedOut: organization === null,
		authenticated,
		stableKeys: stableKey
	});
	const belongsToActiveOrganization = Boolean(organization) && directory?.organizationId === organization?.id;
	const queryEnabled = enabled && clerk.loaded && belongsToActiveOrganization && Boolean(directory);
	const query = require_useQuery.useClerkQuery({
		queryKey,
		queryFn: () => {
			if (!directory) throw new Error("directory is required to fetch sync status");
			return directory.getSyncStatus();
		},
		refetchInterval: () => poll ? pollIntervalMs : false,
		enabled: queryEnabled,
		refetchIntervalInBackground: false
	});
	const revalidate = (0, react.useCallback)(async () => {
		await queryClient.invalidateQueries({ queryKey: invalidationKey });
	}, [queryClient, invalidationKey]);
	return {
		data: queryEnabled ? query.data : void 0,
		error: query.error ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isPolling: queryEnabled && poll,
		revalidate
	};
}

//#endregion
exports.useOrganizationDirectorySyncStatus = useOrganizationDirectorySyncStatus;