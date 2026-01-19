// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5877fdbd99a1fdcde15694f3e73d38ec@o4510731073224704.ingest.de.sentry.io/4510735818686544",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,


  // integrations
  integrations:[
    Sentry.vercelAIIntegration,
    Sentry.consoleLoggingIntegration({levels: ["log","warn","error"]})
  ]
});
