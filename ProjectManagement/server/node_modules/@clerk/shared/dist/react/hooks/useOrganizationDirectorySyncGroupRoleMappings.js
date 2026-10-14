const require_contexts = require('../contexts.js');
const require_use_clerk_query_client = require('../query/use-clerk-query-client.js');
const require_useQuery = require('../query/useQuery.js');
const require_useClearQueriesOnSignOut = require('./useClearQueriesOnSignOut.js');
const require_useOrganizationBase = require('./base/useOrganizationBase.js');
const require_useOrganizationDirectorySync_shared = require('./useOrganizationDirectorySync.shared.js');
let react = require("react");

//#region src/react/hooks/useOrganizationDirectorySyncGroupRoleMappings.tsx
const GROUPS_PAGE_SIZE = 500;
const fetchAllGroups = async (directory) => {
	const groups = [];
	let startingAfter;
	do {
		const page = await directory.getGroups({
			limit: GROUPS_PAGE_SIZE,
			startingAfter
		});
		groups.push(...page.data);
		startingAfter = page.hasNextPage && page.startingAfter ? page.startingAfter : void 0;
	} while (startingAfter);
	return groups;
};
/**
* The groups a Directory Sync directory has received, its group role mappings, and the organization's
* default role, loaded together because the mapping editor needs all three.
*
* @internal
*/
function useOrganizationDirectorySyncGroupRoleMappings(params) {
	const { directory, enabled = true } = params;
	const clerk = require_contexts.useClerkInstanceContext();
	const organization = require_useOrganizationBase.useOrganizationBase();
	const [queryClient] = require_use_clerk_query_client.useClerkQueryClient();
	const { queryKey, invalidationKey, stableKey, authenticated } = require_useOrganizationDirectorySync_shared.useOrganizationDirectorySyncGroupRoleMappingsCacheKeys({
		organizationId: organization?.id ?? null,
		enterpriseConnectionId: directory?.enterpriseConnectionId ?? null,
		directoryId: directory?.id ?? null
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
		queryFn: async () => {
			if (!directory) throw new Error("directory is required to fetch group role mappings");
			const [groups, mappings] = await Promise.all([fetchAllGroups(directory), directory.getGroupRoleMappings()]);
			return {
				groups,
				mappings: mappings.data,
				defaultRole: mappings.defaultRole
			};
		},
		enabled: queryEnabled
	});
	const revalidate = (0, react.useCallback)(async () => {
		await queryClient.invalidateQueries({ queryKey: invalidationKey });
	}, [queryClient, invalidationKey]);
	const replaceGroupRoleMappings = (0, react.useCallback)(async (replaceParams) => {
		if (!directory) return;
		const replaced = await directory.replaceGroupRoleMappings(replaceParams);
		queryClient.setQueryData(queryKey, (previous) => previous ? {
			...previous,
			mappings: replaced.data,
			defaultRole: replaced.defaultRole
		} : previous);
		return replaced.data;
	}, [
		directory,
		queryClient,
		queryKey
	]);
	return {
		data: queryEnabled ? query.data : void 0,
		error: query.error ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		replaceGroupRoleMappings,
		revalidate
	};
}

//#endregion
exports.useOrganizationDirectorySyncGroupRoleMappings = useOrganizationDirectorySyncGroupRoleMappings;