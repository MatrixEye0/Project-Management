//#region src/internal/clerk-js/warnings.d.ts
declare const warnings: {
  proxyUrlAsFunctionNotSupported: string;
  domainAsFunctionNotSupported: string;
  cannotRenderComponentWhenSessionExists: string;
  cannotRenderSignUpComponentWhenSessionExists: string;
  cannotRenderSignUpComponentWhenTaskExists: string;
  cannotRenderComponentWhenTaskDoesNotExist: string;
  cannotRenderSignInComponentWhenSessionExists: string;
  cannotRenderSignInComponentWhenTaskExists: string;
  cannotRenderComponentWhenUserDoesNotExist: string;
  createCannotRenderComponentWhenOrgDoesNotExist: (componentName: "OrganizationProfile" | "InviteMembers" | "ConfigureSSO" | "ConfigureDirectorySync") => string;
  createCannotRenderComponentWhenPermissionIsMissing: (componentName: "InviteMembers", permission: string) => string;
  cannotRenderAnyOrganizationComponent: (componentName: "OrganizationProfile" | "InviteMembers" | "OrganizationSwitcher" | "OrganizationList" | "CreateOrganization" | "TaskChooseOrganization" | "ConfigureSSO" | "ConfigureDirectorySync") => string;
  cannotRenderAnyBillingComponent: (componentName: "PricingTable" | "Checkout" | "PlanDetails") => string;
  cannotOpenUserProfile: string;
  cannotOpenCheckout: string;
  cannotOpenSignInOrSignUp: string;
  cannotRenderAPIKeysComponent: string;
  cannotRenderAPIKeysComponentForOrgWhenUnauthorized: string;
  cannotRenderAPIKeysComponentForUserWhenDisabled: string;
  cannotRenderAPIKeysComponentForOrgWhenDisabled: string;
  cannotRenderOAuthConsentComponentWhenUserDoesNotExist: string;
  cannotRenderOAuthDeviceVerificationComponentWhenUserDoesNotExist: string;
  cannotRenderConfigureSSOComponentWhenUserDoesNotExist: string;
  cannotRenderConfigureSSOComponentWhenDisabled: string;
  cannotRenderConfigureDirectorySyncComponentWhenDisabled: string;
  cannotRenderConfigureSSOComponentWhenEmailAddressDisabled: string;
};
//#endregion
export { warnings };
//# sourceMappingURL=warnings.d.ts.map