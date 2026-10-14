//#region src/internal/clerk-js/enterpriseSSOFactors.ts
function getEnterpriseConnectionFactors(factors) {
	return (factors ?? []).filter((factor) => factor.strategy === "enterprise_sso" && "enterpriseConnectionId" in factor && "enterpriseConnectionName" in factor);
}
function hasMultipleEnterpriseConnections(factors) {
	return getEnterpriseConnectionFactors(factors).length > 1;
}

//#endregion
export { getEnterpriseConnectionFactors, hasMultipleEnterpriseConnections };
//# sourceMappingURL=enterpriseSSOFactors.mjs.map