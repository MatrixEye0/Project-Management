import { ProtectCheckResource } from "../../types/signUpCommon.mjs";
//#region src/internal/clerk-js/protectCheckRunner.d.ts
declare const MAX_EXPIRED_PROTECT_CHECK_RELOADS = 2;
interface ProtectCheckRunnerResource<TResource> {
  getProtectCheck: () => ProtectCheckResource | null | undefined;
  getResource: () => TResource;
  reload: () => Promise<unknown>;
  submitProtectCheck: (params: {
    proofToken: string;
  }) => Promise<TResource>;
}
interface ProtectCheckRunOptions {
  container: HTMLDivElement;
  expiredReloads: {
    current: number;
  };
  signal?: AbortSignal;
  setWidgetVisible?: (visible: boolean) => Promise<void>;
  loadTimeoutMs?: number;
}
/** `reissued` means the expired challenge was replaced by a fresh one on reload, so run again with it. */
type ProtectCheckRunOutcome<TResource> = {
  status: 'resolved';
  resource: TResource;
} | {
  status: 'reissued';
};
/** Runs one Protect challenge against a sign-in or sign-up resource and submits the proof token. */
declare function runProtectCheck<TResource>(resource: ProtectCheckRunnerResource<TResource>, protectCheck: ProtectCheckResource, options: ProtectCheckRunOptions): Promise<ProtectCheckRunOutcome<TResource>>;
//#endregion
export { MAX_EXPIRED_PROTECT_CHECK_RELOADS, ProtectCheckRunOptions, ProtectCheckRunOutcome, ProtectCheckRunnerResource, runProtectCheck };
//# sourceMappingURL=protectCheckRunner.d.mts.map