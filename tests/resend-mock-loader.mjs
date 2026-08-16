// Loader hook to intercept 'resend' import for integration testing.
// Usage: node --import ./tests/resend-mock-loader.mjs tests/test_waitlist_api.js

const MOCK_PATH = new URL('./mock_resend.js', import.meta.url).href;
const RESEND_SPEC = 'resend';

export async function resolve(specifier, context, next) {
  if (specifier === RESEND_SPEC) {
    return { url: MOCK_PATH, shortCircuit: true };
  }
  return next(specifier, context);
}
