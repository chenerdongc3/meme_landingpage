// ESM loader hook: intercepts imports of 'resend' and returns the mock module
import { pathToFileURL } from 'node:url';

const MOCK_PATH = new URL('./mock_resend.js', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'resend') {
    return { url: MOCK_PATH, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
