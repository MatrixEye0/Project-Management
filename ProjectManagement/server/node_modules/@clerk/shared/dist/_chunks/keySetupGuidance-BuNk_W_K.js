
//#region src/errors/keySetupGuidance.ts
const existingAppSteps = `To use an existing Clerk app, run:
npx clerk@latest link
npx clerk@latest env pull

For production keys, run:
npx clerk@latest env pull --instance prod`;
const dashboardFallback = `Or copy keys from https://dashboard.clerk.com/~/api-keys into your .env file.`;
const keySetupGuidance = `To create a new Clerk app, run:
npx clerk@latest init

'npx clerk@latest init' does not need a Clerk account and writes temporary dev keys.

${existingAppSteps}

${dashboardFallback}`;
const existingAppKeyGuidance = `${existingAppSteps}

${dashboardFallback}`;

//#endregion
Object.defineProperty(exports, 'existingAppKeyGuidance', {
  enumerable: true,
  get: function () {
    return existingAppKeyGuidance;
  }
});
Object.defineProperty(exports, 'keySetupGuidance', {
  enumerable: true,
  get: function () {
    return keySetupGuidance;
  }
});
//# sourceMappingURL=keySetupGuidance-BuNk_W_K.js.map