import { EnterpriseSSOFactor } from "../../types/factors.js";
import { SignInFirstFactor } from "../../types/signInCommon.js";
//#region src/internal/clerk-js/enterpriseSSOFactors.d.ts
type EnterpriseConnectionFactor = EnterpriseSSOFactor & {
  enterpriseConnectionId: string;
  enterpriseConnectionName: string;
};
declare function getEnterpriseConnectionFactors(factors: SignInFirstFactor[] | null | undefined): EnterpriseConnectionFactor[];
declare function hasMultipleEnterpriseConnections(factors: SignInFirstFactor[] | null | undefined): boolean;
//#endregion
export { getEnterpriseConnectionFactors, hasMultipleEnterpriseConnections };
//# sourceMappingURL=enterpriseSSOFactors.d.ts.map