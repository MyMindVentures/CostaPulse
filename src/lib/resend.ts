import "server-only";
import { Resend } from "resend";
import { z } from "zod";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const transactionalEmailSchema = z.object({
  to: z.email(),
  subject: z.string().trim().min(1).max(200),
  html: z.string().trim().min(1),
  from: z.string().trim().min(3).max(200).optional()
});

export type TransactionalEmailInput = z.input<typeof transactionalEmailSchema>;

export type SendTransactionalEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: "disabled" | "invalid_input" | "send_failed" };

function resolveFromAddress(from: string | undefined) {
  if (from) {
    return from;
  }

  const configured = process.env.RESEND_FROM_EMAIL;
  return typeof configured === "string" && configured.trim().length > 0
    ? configured.trim()
    : null;
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
  client: Resend | null = resend
): Promise<SendTransactionalEmailResult> {
  if (!client) {
    return { ok: false, reason: "disabled" };
  }

  const parsed = transactionalEmailSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, reason: "invalid_input" };
  }

  const from = resolveFromAddress(parsed.data.from);

  if (!from) {
    return { ok: false, reason: "invalid_input" };
  }

  const { to, subject, html } = parsed.data;

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      html
    });

    if (error || !data?.id) {
      return { ok: false, reason: "send_failed" };
    }

    return { ok: true, id: data.id };
  } catch {
    return { ok: false, reason: "send_failed" };
  }
}
