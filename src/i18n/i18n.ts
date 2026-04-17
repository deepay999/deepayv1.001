/**
 * Thin compatibility shim — delegates to the canonical i18n module (index.ts).
 * All initialization, resources and storage key live in ./index.
 */
export { changeLanguage as setLanguage, default } from './index';
