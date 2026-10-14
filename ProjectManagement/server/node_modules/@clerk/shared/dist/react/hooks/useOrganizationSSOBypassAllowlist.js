const require_contexts = require('../contexts.js');
const require_keep_previous_data = require('../query/keep-previous-data.js');
const require_use_clerk_query_client = require('../query/use-clerk-query-client.js');
const require_useQuery = require('../query/useQuery.js');
const require_useClearQueriesOnSignOut = require('./useClearQueriesOnSignOut.js');
const require_useOrganizationBase = require('./base/useOrganizationBase.js');
const require_useOrganizationSSOBypassAllowlist_shared = require('./useOrganizationSSOBypassAllowlist.shared.js');
let react = require("react");

//#region src/react/hooks/useOrganizationSSOBypassAllowlist.tsx
/**
* The SSO bypass allowlist of the active organization
*
* @internal
*/
function useOrganizationSSOBypassAllowlist(params = {}) {
	const { keepPreviousData = false, enabled = true } = params;
	const clerk = require_contexts.useClerkInstanceContext();
	const organization = require_useOrganizationBase.useOrganizationBase();
	const [queryClient] = require_use_clerk_query_client.useClerkQueryClient();
	const { queryKey, stableKey, authenticated } = require_useOrganizationSSOBypassAllowlist_shared.useOrganizationSSOBypassAllowlistCacheKeys({ organizationId: organization?.id ?? null });
	const queryEnabled = enabled && clerk.loaded && Boolean(organization);
	require_useClearQueriesOnSignOut.useClearQueriesOnSignOut({
		isSignedOut: organization === null,
		authenticated,
		stableKeys: stableKey
	});
	const query = require_useQuery.useClerkQuery({
		queryKey,
		queryFn: () => organization?.ssoBypassAllowlist.getUsers(),
		enabled: queryEnabled,
		placeholderData: require_keep_previous_data.defineKeepPreviousDataFn(keepPreviousData)
	});
	const revalidate = (0, react.useCallback)(() => queryClient.invalidateQueries({ queryKey: [stableKey] }), [queryClient, stableKey]);
	const addUser = (0, react.useCallback)(async (addParams) => {
		const added = await organization?.ssoBypassAllowlist.addUser(addParams);
		await revalidate();
		return added;
	}, [organization, revalidate]);
	const addUsers = (0, react.useCallback)(async (addParams) => {
		try {
			return await organization?.ssoBypassAllowlist.addUsers(addParams);
		} finally {
			await revalidate();
		}
	}, [organization, revalidate]);
	const removeUser = (0, react.useCallback)(async (userId) => {
		const removed = await organization?.ssoBypassAllowlist.removeUser(userId);
		await revalidate();
		return removed;
	}, [organization, revalidate]);
	return {
		data: query.data,
		error: query.error ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		addUser,
		addUsers,
		removeUser,
		revalidate
	};
}

//#endregion
exports.useOrganizationSSOBypassAllowlist = useOrganizationSSOBypassAllowlist;