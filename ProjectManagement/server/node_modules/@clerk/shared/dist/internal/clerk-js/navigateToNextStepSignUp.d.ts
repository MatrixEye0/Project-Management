import { SignUpResource } from "../../types/signUp.js";
//#region src/internal/clerk-js/navigateToNextStepSignUp.d.ts
type NavigateToNextStepSignUpProps = {
  signUp: SignUpResource;
  continueSignUpUrl: string;
  verifyEmailAddressUrl: string;
  verifyPhoneNumberUrl: string;
  signUpProtectCheckUrl: string;
  enterpriseConnectionsUrl?: string;
  navigate: (to: string, options?: {
    searchParams?: URLSearchParams;
  }) => Promise<unknown>;
};
/**
 * Routes a sign-up that's still in `missing_requirements` to the appropriate
 * next step:
 *
 * - If the sign-up is protect-gated, go to the protect-check challenge.
 * - Otherwise, if `enterpriseConnectionsUrl` is set and `enterprise_sso` is
 *   missing, go to the enterprise connection chooser.
 * - Otherwise, if there are missing fields, go straight to the continue page so
 *   the user can fill them in.
 * - Otherwise, hand off to `completeSignUpFlow` which routes unverified email
 *   or phone identifications to their respective verify pages.
 *
 * Used by both the OAuth callback handler and the sign-in `signUpIfMissing`
 * transfer flow so they stay in lockstep.
 *
 * @internal
 */
declare const navigateToNextStepSignUp: ({
  signUp,
  continueSignUpUrl,
  verifyEmailAddressUrl,
  verifyPhoneNumberUrl,
  signUpProtectCheckUrl,
  enterpriseConnectionsUrl,
  navigate
}: NavigateToNextStepSignUpProps) => Promise<unknown> | undefined;
//#endregion
export { navigateToNextStepSignUp };
//# sourceMappingURL=navigateToNextStepSignUp.d.ts.map