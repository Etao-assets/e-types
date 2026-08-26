import { z } from 'zod';

export enum WebviewScreenPurpose {
  UCC2FA = 'ucc2fa',
  ORDER_PLACE_2FA = 'order_place_2fa',
  ORDER_CANCEL_2FA = 'order_cancel_2fa',
  ENACH_MANDATE = 'enach_mandate',
  SXP_REG_2FA = 'sxp_reg_2fa',
  MANDATE_CANCEL_2FA = 'mandate_cancel_2fa',
  SXP_CANCEL_2FA = 'sxp_cancel_2fa',
}

// --- Schemas ---

export const WebviewEventQuerySchema = z.object({
  /** Discriminant that tells the native WebView what action to take */
  purpose: z.nativeEnum(WebviewScreenPurpose),
  /** Optional context payload — e.g. redirect target after re-login */
  data: z.string().optional(),
});

// --- Inferred Types ---

export type WebviewEventQuery = z.infer<typeof WebviewEventQuerySchema>;

// ── Generic redirection ────────────────────────────────────────────────────

/**
 * Purpose values for the generic /redirect page.
 * Used by the native WebView URL-change listener and postMessage handler.
 */
export enum RedirectionPurpose {
  /** Native app should log the user out and show a session-expired screen */
  SESSION_TIMEOUT = 'st',
  /** Native app should pop the current screen / navigate back */
  GO_BACK = 'gb',
}

export const RedirectionQuerySchema = z.object({
  r: z.nativeEnum(RedirectionPurpose),
  /** Optional context — e.g. deep-link target after re-login */
  data: z.string().optional(),
});

export type RedirectionQuery = z.infer<typeof RedirectionQuerySchema>;
