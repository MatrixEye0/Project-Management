//#region src/errors/errorThrower.d.ts
declare const DefaultMessages: Readonly<{
  InvalidProxyUrlErrorMessage: "The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})";
  InvalidPublishableKeyErrorMessage: "The publishableKey passed to Clerk is invalid (key={{key}}, expected format: pk_test_... or pk_live_...).\n\nTo create a new Clerk app, run:\nnpx clerk@latest init\n\n'npx clerk@latest init' does not need a Clerk account and writes temporary dev keys.\n\nTo use an existing Clerk app, run:\nnpx clerk@latest link\nnpx clerk@latest env pull\n\nFor production keys, run:\nnpx clerk@latest env pull --instance prod\n\nOr copy keys from https://dashboard.clerk.com/~/api-keys into your .env file.";
  MissingPublishableKeyErrorMessage: "Clerk keys are missing from your environment.\n\nTo create a new Clerk app, run:\nnpx clerk@latest init\n\n'npx clerk@latest init' does not need a Clerk account and writes temporary dev keys.\n\nTo use an existing Clerk app, run:\nnpx clerk@latest link\nnpx clerk@latest env pull\n\nFor production keys, run:\nnpx clerk@latest env pull --instance prod\n\nOr copy keys from https://dashboard.clerk.com/~/api-keys into your .env file.";
  MissingSecretKeyErrorMessage: "Missing secretKey.\n\nTo use an existing Clerk app, run:\nnpx clerk@latest link\nnpx clerk@latest env pull\n\nFor production keys, run:\nnpx clerk@latest env pull --instance prod\n\nOr copy keys from https://dashboard.clerk.com/~/api-keys into your .env file.";
  MissingClerkProvider: "{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider";
}>;
type MessageKeys = keyof typeof DefaultMessages;
type Messages = Record<MessageKeys, string>;
type CustomMessages = Partial<Messages>;
type ErrorThrowerOptions = {
  packageName: string;
  customMessages?: CustomMessages;
};
interface ErrorThrower {
  setPackageName(options: ErrorThrowerOptions): ErrorThrower;
  setMessages(options: ErrorThrowerOptions): ErrorThrower;
  throwInvalidPublishableKeyError(params: {
    key?: string;
  }): never;
  throwInvalidProxyUrl(params: {
    url?: string;
  }): never;
  throwMissingPublishableKeyError(): never;
  throwMissingSecretKeyError(): never;
  throwMissingClerkProviderError(params: {
    source?: string;
  }): never;
  throw(message: string): never;
}
/**
 * Builds an error thrower.
 *
 * @internal
 */
declare function buildErrorThrower({
  packageName,
  customMessages
}: ErrorThrowerOptions): ErrorThrower;
//#endregion
export { ErrorThrower, ErrorThrowerOptions, buildErrorThrower };
//# sourceMappingURL=errorThrower.d.ts.map