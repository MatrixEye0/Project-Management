import { UseOAuthDeviceVerificationReturn } from "./useOAuthDeviceVerification.types.mjs";

//#region src/react/hooks/useOAuthDeviceVerification.d.ts
/**
 * Provides state and actions for building a custom OAuth device verification flow.
 *
 * @returns The current verification state and methods for looking up, approving, denying, or resetting a request.
 *
 * @example
 * ### Look up a device authorization request
 *
 * ```tsx
 * import { useOAuthDeviceVerification } from '@clerk/react';
 *
 * function CustomDeviceVerification({ userCode }: { userCode: string }) {
 *   const { data, isLoading, lookup } = useOAuthDeviceVerification();
 *
 *   const handleLookup = async () => {
 *     await lookup({ userCode });
 *   };
 *
 *   return (
 *     <>
 *       <button disabled={isLoading} onClick={handleLookup}>Verify code</button>
 *       {data && <p>Authorize {data.oauthApplicationName}?</p>}
 *     </>
 *   );
 * }
 * ```
 */
declare function useOAuthDeviceVerification(): UseOAuthDeviceVerificationReturn;
//#endregion
export { useOAuthDeviceVerification };
//# sourceMappingURL=useOAuthDeviceVerification.d.mts.map