const require_stable_keys = require('../stable-keys.js');
const require_createCacheKeys = require('./createCacheKeys.js');
let react = require("react");

//#region src/react/hooks/useOrganizationSSOBypassAllowlist.shared.ts
/**
* @internal
*/
function useOrganizationSSOBypassAllowlistCacheKeys(params) {
	const { organizationId } = params;
	return (0, react.useMemo)(() => {
		return require_createCacheKeys.createCacheKeys({
			stablePrefix: require_stable_keys.INTERNAL_STABLE_KEYS.ORGANIZATION_SSO_BYPASS_ALLOWLIST_KEY,
			authenticated: Boolean(organizationId),
			tracked: { organizationId: organizationId ?? null },
			untracked: { args: {} }
		});
	}, [organizationId]);
}

//#endregion
exports.useOrganizationSSOBypassAllowlistCacheKeys = useOrganizationSSOBypassAllowlistCacheKeys;