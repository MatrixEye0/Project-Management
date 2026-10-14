//#region src/errors/metamaskError.d.ts
interface MetamaskError extends Error {
  code: 4001 | 32602 | 32603;
  message: string;
  data?: unknown;
}
//#endregion
export { MetamaskError };
//# sourceMappingURL=metamaskError.d.mts.map