"use server";

import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createGrantInputSchema = z.object({
  recipientEmail: z.string().trim().email(),
  recipientAgencyLabel: z.string().trim().max(200).nullable().optional(),
  documentIds: z.array(z.string().uuid()).min(1),
  selectedFileRoles: z
    .array(
      z.enum([
        "primary",
        "front",
        "back",
        "translation",
        "attachment",
        "supporting_evidence"
      ])
    )
    .min(1),
  accessExpiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  permissionViewFiles: z.boolean(),
  permissionDownloadFiles: z.boolean(),
  permissionIncludeHistory: z.boolean(),
  permissionIncludeDocumentNumber: z.boolean(),
  message: z.string().trim().max(2000).nullable().optional()
});

type RpcClient = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export type CreateCredentialGrantAndInviteResult =
  | { ok: true; grantId: string }
  | { ok: false; message: string };

const createCredentialShareLinkSchema = z.object({
  grantId: z.string().uuid(),
  expiresAt: z.string().datetime({ offset: true }),
  recipientEmail: z.string().trim().email().nullable().optional(),
  recipientAgencyLabel: z.string().trim().max(200).nullable().optional(),
  maxViews: z.number().int().positive().nullable().optional(),
  maxDownloads: z.number().int().positive().nullable().optional()
});

const revokeCredentialGrantSchema = z.object({
  grantId: z.string().uuid(),
  reason: z.string().trim().max(500).nullable().optional()
});

const resendCredentialMagicLinkSchema = z.object({
  grantId: z.string().uuid(),
  recipientEmail: z.string().trim().email()
});

export type CreateCredentialShareLinkResult =
  | { ok: true; shareId: string; shareUrl: string }
  | { ok: false; message: string };

export type RevokeCredentialGrantResult =
  | { ok: true }
  | { ok: false; message: string };

export type ResendCredentialMagicLinkResult =
  | { ok: true }
  | { ok: false; message: string };

function getAuthCallbackUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      const origin = new URL(configured).origin;
      return `${origin}/auth/callback?next=/portal/credentials`;
    } catch {
      // Fall through to localhost fallback.
    }
  }
  return "http://localhost:3000/auth/callback?next=/portal/credentials";
}

export async function createCredentialGrantAndSendMagicLinkAction(
  input: z.infer<typeof createGrantInputSchema>
): Promise<CreateCredentialGrantAndInviteResult> {
  const parsed = createGrantInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid credential invitation payload." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Authentication is not configured." };
  }

  const rpcClient = supabase as unknown as RpcClient;
  const { data: grantData, error: grantError } = await rpcClient.rpc(
    "create_credential_access_grant",
    {
      p_recipient_email: parsed.data.recipientEmail.toLowerCase(),
      p_recipient_agency_label: parsed.data.recipientAgencyLabel ?? null,
      p_document_ids: parsed.data.documentIds,
      p_selected_file_roles: parsed.data.selectedFileRoles,
      p_access_expires_at: parsed.data.accessExpiresAt ?? null,
      p_permission_view_files: parsed.data.permissionViewFiles,
      p_permission_download_files: parsed.data.permissionDownloadFiles,
      p_permission_include_history: parsed.data.permissionIncludeHistory,
      p_permission_include_document_number:
        parsed.data.permissionIncludeDocumentNumber,
      p_message: parsed.data.message ?? null
    }
  );

  if (grantError || typeof grantData !== "string") {
    return {
      ok: false,
      message: grantError?.message ?? "Failed to create credential grant."
    };
  }

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: parsed.data.recipientEmail.toLowerCase(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: getAuthCallbackUrl()
    }
  });

  if (otpError) {
    return { ok: false, message: otpError.message };
  }

  const { error: markError } = await rpcClient.rpc(
    "mark_credential_magic_link_sent",
    {
      p_grant_id: grantData
    }
  );

  if (markError) {
    return { ok: false, message: markError.message };
  }

  return { ok: true, grantId: grantData };
}

function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to localhost fallback.
    }
  }
  return "http://localhost:3000";
}

function createShareTokenParts() {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export async function createCredentialShareLinkAction(
  input: z.infer<typeof createCredentialShareLinkSchema>
): Promise<CreateCredentialShareLinkResult> {
  const parsed = createCredentialShareLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid share-link payload." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Authentication is not configured." };
  }

  const { rawToken, tokenHash } = createShareTokenParts();
  const rpcClient = supabase as unknown as RpcClient;
  const { data, error } = await rpcClient.rpc("create_credential_share_link", {
    p_grant_id: parsed.data.grantId,
    p_token_hash: tokenHash,
    p_expires_at: parsed.data.expiresAt,
    p_recipient_email: parsed.data.recipientEmail ?? null,
    p_recipient_agency_label: parsed.data.recipientAgencyLabel ?? null,
    p_max_views: parsed.data.maxViews ?? null,
    p_max_downloads: parsed.data.maxDownloads ?? null
  });

  if (error || typeof data !== "string") {
    return {
      ok: false,
      message: error?.message ?? "Failed to create share link."
    };
  }

  const shareUrl = `${getSiteOrigin()}/shared/credentials/${rawToken}`;
  return { ok: true, shareId: data, shareUrl };
}

export async function revokeCredentialGrantAction(
  input: z.infer<typeof revokeCredentialGrantSchema>
): Promise<RevokeCredentialGrantResult> {
  const parsed = revokeCredentialGrantSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid revoke payload." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Authentication is not configured." };
  }

  const rpcClient = supabase as unknown as RpcClient;
  const { error } = await rpcClient.rpc("revoke_credential_access_grant", {
    p_grant_id: parsed.data.grantId,
    p_reason: parsed.data.reason ?? null
  });
  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function resendCredentialMagicLinkAction(
  input: z.infer<typeof resendCredentialMagicLinkSchema>
): Promise<ResendCredentialMagicLinkResult> {
  const parsed = resendCredentialMagicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid resend payload." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Authentication is not configured." };
  }

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: parsed.data.recipientEmail.toLowerCase(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: getAuthCallbackUrl()
    }
  });
  if (otpError) {
    return { ok: false, message: otpError.message };
  }

  const rpcClient = supabase as unknown as RpcClient;
  const { error: markError } = await rpcClient.rpc(
    "mark_credential_magic_link_sent",
    {
      p_grant_id: parsed.data.grantId
    }
  );
  if (markError) {
    return { ok: false, message: markError.message };
  }

  return { ok: true };
}
