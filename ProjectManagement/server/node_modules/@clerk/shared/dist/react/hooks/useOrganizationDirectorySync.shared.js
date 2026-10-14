const require_stable_keys = require('../stable-keys.js');
const require_createCacheKeys = require('./createCacheKeys.js');
let react = require("react");

//#region src/react/hooks/useOrganizationDirectorySync.shared.ts
/**
* @internal
*/
function useOrganizationDirectorySyncCacheKeys(params) {
	const { organizationId, enterpriseConnectionId } = params;
	return (0, react.useMemo)(() => {
		return require_createCacheKeys.createCacheKeys({
			stablePrefix: require_stable_keys.INTERNAL_STABLE_KEYS.ORGANIZATION_DIRECTORY_SYNC_KEY,
			authenticated: Boolean(organizationId),
			tracked: {
				organizationId: organizationId ?? null,
				enterpriseConnectionId: enterpriseConnectionId ?? null
			},
			untracked: { args: {} }
		});
	}, [organizationId, enterpriseConnectionId]);
}
/**
* @internal
*/
function useOrganizationDirectorySyncUsersCacheKeys(params) {
	const { organizationId, enterpriseConnectionId, directoryId, args } = params;
	return (0, react.useMemo)(() => {
		return require_createCacheKeys.createCacheKeys({
			stablePrefix: require_stable_keys.INTERNAL_STABLE_KEYS.ORGANIZATION_DIRECTORY_SYNC_USERS_KEY,
			authenticated: Boolean(organizationId),
			tracked: {
				organizationId: organizationId ?? null,
				enterpriseConnectionId: enterpriseConnectionId ?? null,
				directoryId: directoryId ?? null
			},
			untracked: { args }
		});
	}, [
		organizationId,
		enterpriseConnectionId,
		directoryId,
		JSON.stringify(args)
	]);
}
/**
* @internal
*/
function useOrganizationDirectorySyncStatusCacheKeys(params) {
	const { organizationId, enterpriseConnectionId, directoryId } = params;
	return (0, react.useMemo)(() => {
		return require_createCacheKeys.createCacheKeys({
			stablePrefix: require_stable_keys.INTERNAL_STABLE_KEYS.ORGANIZATION_DIRECTORY_SYNC_STATUS_KEY,
			authenticated: Boolean(organizationId),
			tracked: {
				organizationId: organizationId ?? null,
				enterpriseConnectionId: enterpriseConnectionId ?? null,
				directoryId: directoryId ?? null
			},
			untracked: { args: {} }
		});
	}, [
		organizationId,
		enterpriseConnectionId,
		directoryId
	]);
}
/**
* @internal
*/
function useOrganizationDirectorySyncGroupRoleMappingsCacheKeys(params) {
	const { organizationId, enterpriseConnectionId, directoryId } = params;
	return (0, react.useMemo)(() => {
		return require_createCacheKeys.createCacheKeys({
			stablePrefix: require_stable_keys.INTERNAL_STABLE_KEYS.ORGANIZATION_DIRECTORY_SYNC_GROUP_ROLE_MAPPINGS_KEY,
			authenticated: Boolean(organizationId),
			tracked: {
				organizationId: organizationId ?? null,
				enterpriseConnectionId: enterpriseConnectionId ?? null,
				directoryId: directoryId ?? null
			},
			untracked: { args: {} }
		});
	}, [
		organizationId,
		enterpriseConnectionId,
		directoryId
	]);
}

//#endregion
exports.useOrganizationDirectorySyncCacheKeys = useOrganizationDirectorySyncCacheKeys;
exports.useOrganizationDirectorySyncGroupRoleMappingsCacheKeys = useOrganizationDirectorySyncGroupRoleMappingsCacheKeys;
exports.useOrganizationDirectorySyncStatusCacheKeys = useOrganizationDirectorySyncStatusCacheKeys;
exports.useOrganizationDirectorySyncUsersCacheKeys = useOrganizationDirectorySyncUsersCacheKeys;