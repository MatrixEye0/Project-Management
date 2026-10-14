import { t as ClerkRuntimeError } from "../../_chunks/clerkRuntimeError-DlesLWqO.mjs";
import { C as isClerkAPIResponseError } from "../../_chunks/error-DXioMHds.mjs";
import { ERROR_CODES } from "./constants.mjs";
import { executeProtectCheck } from "./protectCheck.mjs";

//#region src/internal/clerk-js/protectCheckRunner.ts
const MAX_EXPIRED_PROTECT_CHECK_RELOADS = 2;
const isExpired = (protectCheck) => protectCheck.expiresAt !== void 0 && protectCheck.expiresAt < Date.now();
const expiredError = () => new ClerkRuntimeError("Protect verification expired", { code: ERROR_CODES.PROTECT_CHECK_TIMED_OUT });
const abortedError = () => new ClerkRuntimeError("Protect check aborted by caller", { code: "protect_check_aborted" });
const reloadExpired = async (resource, expiredReloads) => {
	if (expiredReloads.current >= 2) throw expiredError();
	expiredReloads.current += 1;
	await resource.reload();
	const refreshed = resource.getProtectCheck();
	if (!refreshed) return {
		status: "resolved",
		resource: resource.getResource()
	};
	if (isExpired(refreshed)) throw expiredError();
	return { status: "reissued" };
};
/** Runs one Protect challenge against a sign-in or sign-up resource and submits the proof token. */
async function runProtectCheck(resource, protectCheck, options) {
	const { container, expiredReloads, signal, setWidgetVisible, loadTimeoutMs } = options;
	if (signal?.aborted) throw abortedError();
	if (isExpired(protectCheck)) return reloadExpired(resource, expiredReloads);
	const proofToken = await executeProtectCheck(protectCheck, container, {
		signal,
		setWidgetVisible,
		loadTimeoutMs
	});
	if (signal?.aborted) throw abortedError();
	try {
		return {
			status: "resolved",
			resource: await resource.submitProtectCheck({ proofToken })
		};
	} catch (err) {
		if (signal?.aborted) throw abortedError();
		if (isClerkAPIResponseError(err) && err.errors?.[0]?.code === ERROR_CODES.PROTECT_CHECK_ALREADY_RESOLVED) {
			await resource.reload();
			return {
				status: "resolved",
				resource: resource.getResource()
			};
		}
		throw err;
	}
}

//#endregion
export { MAX_EXPIRED_PROTECT_CHECK_RELOADS, runProtectCheck };
//# sourceMappingURL=protectCheckRunner.mjs.map