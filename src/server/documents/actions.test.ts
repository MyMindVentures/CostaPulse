import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  })
}));

const { revalidatePath } = vi.hoisted(() => ({
  revalidatePath: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect
}));

vi.mock("next/cache", () => ({
  revalidatePath
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn()
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createProfessionalDocumentAction,
  deleteCertificateFileAction,
  uploadCertificateFileAction,
  setProfessionalDocumentVerificationAction
} from "./actions";

type MockContext = {
  insertedDocumentPayloads: Array<Record<string, unknown>>;
  insertedFilePayloads: Array<Record<string, unknown>>;
  updatedDocumentStatusPayloads: Array<Record<string, unknown>>;
  updateEqCalls: Array<{ column: string; value: string }>;
  rpc: ReturnType<typeof vi.fn>;
};

function createRenewSupabaseMock(input?: { roles?: string[] }): {
  client: unknown;
  ctx: MockContext;
} {
  const insertedDocumentPayloads: Array<Record<string, unknown>> = [];
  const insertedFilePayloads: Array<Record<string, unknown>> = [];
  const updatedDocumentStatusPayloads: Array<Record<string, unknown>> = [];
  const updateEqCalls: Array<{ column: string; value: string }> = [];

  const rpc = vi.fn().mockResolvedValue({
    data: "renewed-document.pdf",
    error: null
  });

  const documentInsert = vi.fn((payload: Record<string, unknown>) => {
    insertedDocumentPayloads.push(payload);
    return {
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "new-document-id" },
          error: null
        })
      })
    };
  });

  const buildDocumentSingle = (documentId: string) => {
    if (documentId !== "11111111-1111-4111-8111-111111111111") {
      return Promise.resolve({
        data: null,
        error: { message: "Document not found" }
      });
    }

    return Promise.resolve({
      data: {
        id: documentId,
        profile_id: "profile-1",
        document_type: "passport",
        document_number: "A12345678",
        issued_on: "2024-01-01",
        expires_on: "2034-01-01",
        verification_status: "verified",
        status: "active"
      },
      error: null
    });
  };

  const documentUpdate = vi.fn((payload: Record<string, unknown>) => {
    updatedDocumentStatusPayloads.push(payload);
    return {
      eq: vi.fn((column: string, value: string) => {
        updateEqCalls.push({ column, value });
        return Promise.resolve({ error: null });
      })
    };
  });

  const documentsTable = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn((column: string, value: string) => ({
        single: vi.fn(() => buildDocumentSingle(column === "id" ? value : ""))
      }))
    }),
    insert: documentInsert,
    update: documentUpdate,
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    })
  };

  const profileTable = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: "profile-1",
            display_name: "Kevin",
            email: "kevin@example.com"
          },
          error: null
        })
      })
    })
  };

  const fileTable = {
    insert: vi.fn((payload: Record<string, unknown>) => {
      insertedFilePayloads.push(payload);
      return Promise.resolve({ error: null });
    })
  };

  const userRolesTable = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: (input?.roles ?? ["administrator"]).map((role) => ({ role })),
        error: null
      })
    })
  };

  const from = vi.fn((table: string) => {
    switch (table) {
      case "profiles":
        return profileTable;
      case "professional_documents":
        return documentsTable;
      case "professional_document_files":
        return fileTable;
      case "user_roles":
        return userRolesTable;
      default:
        throw new Error(`Unexpected table: ${table}`);
    }
  });

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "profile-1" } }
      })
    },
    from,
    rpc,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null })
      })
    }
  };

  return {
    client,
    ctx: {
      insertedDocumentPayloads,
      insertedFilePayloads,
      updatedDocumentStatusPayloads,
      updateEqCalls,
      rpc
    }
  };
}

function createFormData(input?: { replacesDocumentId?: string }): FormData {
  const form = new FormData();
  form.set("documentType", "passport");
  form.set("category", "identity");
  form.set("title", "Passport Renewal");
  form.set("documentNumber", "A12345678");
  form.set("issuingAuthority", "Gov");
  form.set("issuedOn", "2024-01-01");
  form.set("validFrom", "2024-01-01");
  form.set("expiresOn", "2034-01-01");
  form.set("confidentialityLevel", "private");
  form.set("fileRole", "primary");

  if (input?.replacesDocumentId) {
    form.set("replacesDocumentId", input.replacesDocumentId);
  }

  const file = new File(["pdf"], "passport.pdf", {
    type: "application/pdf"
  });
  form.set("file", file);

  return form;
}

function createVerificationFormData() {
  const form = new FormData();
  form.set("documentId", "11111111-1111-4111-8111-111111111111");
  form.set("verificationStatus", "verified");
  return form;
}

describe("createProfessionalDocumentAction renew flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links replaces_document_id and marks previous document as replaced", async () => {
    const { client, ctx } = createRenewSupabaseMock();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    vi.mocked(createSupabaseAdminClient).mockReturnValue(client as never);

    const formData = createFormData({
      replacesDocumentId: "11111111-1111-4111-8111-111111111111"
    });

    await expect(createProfessionalDocumentAction(formData)).rejects.toThrow(
      "redirect:/admin/documents/new-document-id?status=created"
    );

    expect(ctx.insertedDocumentPayloads).toHaveLength(1);
    expect(ctx.insertedDocumentPayloads[0]).toMatchObject({
      replaces_document_id: "11111111-1111-4111-8111-111111111111",
      title: "Passport Renewal"
    });

    expect(ctx.updatedDocumentStatusPayloads).toContainEqual({
      status: "replaced"
    });
    expect(ctx.updateEqCalls).toContainEqual({
      column: "id",
      value: "11111111-1111-4111-8111-111111111111"
    });

    expect(ctx.insertedFilePayloads).toHaveLength(1);
    expect(ctx.rpc).toHaveBeenCalledWith(
      "build_professional_document_filename",
      expect.objectContaining({
        p_document_type: "passport",
        p_document_number: "A12345678"
      })
    );

    expect(revalidatePath).toHaveBeenCalledWith("/admin/documents");
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/documents/new-document-id"
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/documents/11111111-1111-4111-8111-111111111111"
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/documents/11111111-1111-4111-8111-111111111111/edit"
    );
  });

  it("does not set replacement status when renew source is absent", async () => {
    const { client, ctx } = createRenewSupabaseMock();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    vi.mocked(createSupabaseAdminClient).mockReturnValue(client as never);

    await expect(
      createProfessionalDocumentAction(createFormData())
    ).rejects.toThrow(
      "redirect:/admin/documents/new-document-id?status=created"
    );

    expect(ctx.insertedDocumentPayloads).toHaveLength(1);
    expect(ctx.insertedDocumentPayloads[0].replaces_document_id).toBeNull();
    expect(ctx.updatedDocumentStatusPayloads).toHaveLength(0);
  });

  it("redirects to forbidden when caller lacks documents section access", async () => {
    const { client } = createRenewSupabaseMock({ roles: ["partner"] });

    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    await expect(
      createProfessionalDocumentAction(createFormData())
    ).rejects.toThrow("redirect:/admin?auth=forbidden");
  });

  it("denies verification mutation when caller lacks mutation role", async () => {
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "profile-1" } }
        })
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "profile-1",
                    display_name: "Viewer",
                    email: "viewer@example.com"
                  },
                  error: null
                })
              })
            })
          };
        }

        if (table === "user_roles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ role: "finance_manager" }],
                error: null
              })
            })
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      })
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    vi.mocked(createSupabaseAdminClient).mockReturnValue(client as never);

    await expect(
      setProfessionalDocumentVerificationAction(createVerificationFormData())
    ).rejects.toThrow("redirect:/admin?auth=forbidden");
  });
});

describe("certificate file actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads file for existing certificate and creates linked document when needed", async () => {
    const insertedDocumentPayloads: Array<Record<string, unknown>> = [];
    const insertedFilePayloads: Array<Record<string, unknown>> = [];
    const uploadedPaths: string[] = [];

    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "profile-1" } }
        })
      },
      rpc: vi.fn().mockResolvedValue({
        data: "certificate-file.pdf",
        error: null
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn((path: string) => {
            uploadedPaths.push(path);
            return Promise.resolve({ error: null });
          }),
          remove: vi.fn().mockResolvedValue({ error: null })
        })
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "profile-1",
                    display_name: "Admin User",
                    email: "admin@example.com"
                  },
                  error: null
                })
              })
            })
          };
        }

        if (table === "user_roles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ role: "administrator" }],
                error: null
              })
            })
          };
        }

        if (table === "team_member_certificates") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "8ce904db-ba62-41a7-ba90-e006a243e7ab",
                    title: "Medical Certificate",
                    certificate_type: "medical",
                    issued_on: "2026-01-01",
                    valid_from: "2026-01-01",
                    expires_on: "2028-01-01",
                    does_not_expire: false,
                    verification_status: "pending"
                  },
                  error: null
                })
              })
            })
          };
        }

        if (table === "professional_documents") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: null,
                      error: null
                    })
                  })
                })
              })
            }),
            insert: vi.fn((payload: Record<string, unknown>) => {
              insertedDocumentPayloads.push(payload);
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: "d7f87f61-b2f3-495e-84b8-0fd36acbb4b1",
                      profile_id: "profile-1",
                      document_type: "other",
                      document_number: null,
                      issued_on: "2026-01-01",
                      expires_on: "2028-01-01"
                    },
                    error: null
                  })
                })
              };
            })
          };
        }

        if (table === "professional_document_files") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: null,
                      error: null
                    })
                  })
                })
              })
            }),
            insert: vi.fn((payload: Record<string, unknown>) => {
              insertedFilePayloads.push(payload);
              return Promise.resolve({ error: null });
            })
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      })
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    vi.mocked(createSupabaseAdminClient).mockReturnValue(client as never);

    const formData = new FormData();
    formData.set("certificateId", "8ce904db-ba62-41a7-ba90-e006a243e7ab");
    formData.set("fileRole", "primary");
    formData.set(
      "file",
      new File(["pdf"], "medical.pdf", {
        type: "application/pdf"
      })
    );

    await expect(uploadCertificateFileAction(formData)).rejects.toThrow(
      "redirect:/admin/documents/certificates/8ce904db-ba62-41a7-ba90-e006a243e7ab?status=file_uploaded"
    );

    expect(insertedDocumentPayloads).toHaveLength(1);
    expect(insertedDocumentPayloads[0]).toMatchObject({
      team_member_certificate_id: "8ce904db-ba62-41a7-ba90-e006a243e7ab",
      document_type: "other",
      category: "other"
    });
    expect(insertedFilePayloads).toHaveLength(1);
    expect(uploadedPaths[0]).toContain(
      "profile-1/d7f87f61-b2f3-495e-84b8-0fd36acbb4b1/"
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/documents/certificates/8ce904db-ba62-41a7-ba90-e006a243e7ab"
    );
  });

  it("deletes certificate file and removes flow-managed empty linked document", async () => {
    const removedPaths: string[] = [];

    const serverClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "profile-1" } }
        })
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "profile-1",
                    display_name: "Admin User",
                    email: "admin@example.com"
                  },
                  error: null
                })
              })
            })
          };
        }

        if (table === "user_roles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ role: "administrator" }],
                error: null
              })
            })
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      })
    };

    const adminClient = {
      storage: {
        from: vi.fn().mockReturnValue({
          remove: vi.fn((paths: string[]) => {
            removedPaths.push(...paths);
            return Promise.resolve({ error: null });
          })
        })
      },
      from: vi.fn((table: string) => {
        if (table === "professional_document_files") {
          return {
            select: vi.fn((_: string, options?: { head?: boolean }) => {
              if (options?.head) {
                return {
                  eq: vi.fn().mockResolvedValue({ count: 0, error: null })
                };
              }

              return {
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: "bbc2e9e2-a570-4d63-8f53-f3d5f498f649",
                      document_id: "d7f87f61-b2f3-495e-84b8-0fd36acbb4b1",
                      file_role: "primary",
                      is_current: false,
                      version_number: 1,
                      storage_bucket: "professional-credentials",
                      storage_path:
                        "profile-1/d7f87f61-b2f3-495e-84b8-0fd36acbb4b1/medical.pdf"
                    },
                    error: null
                  })
                })
              };
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          };
        }

        if (table === "professional_documents") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: "d7f87f61-b2f3-495e-84b8-0fd36acbb4b1",
                      metadata: { source: "certificate-file-flow" }
                    },
                    error: null
                  })
                })
              })
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
              })
            })
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      })
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      serverClient as never
    );
    vi.mocked(createSupabaseAdminClient).mockReturnValue(adminClient as never);

    const formData = new FormData();
    formData.set("certificateId", "8ce904db-ba62-41a7-ba90-e006a243e7ab");
    formData.set("fileId", "bbc2e9e2-a570-4d63-8f53-f3d5f498f649");

    await expect(deleteCertificateFileAction(formData)).rejects.toThrow(
      "redirect:/admin/documents/certificates/8ce904db-ba62-41a7-ba90-e006a243e7ab?status=file_deleted"
    );

    expect(removedPaths).toContain(
      "profile-1/d7f87f61-b2f3-495e-84b8-0fd36acbb4b1/medical.pdf"
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/documents/certificates/8ce904db-ba62-41a7-ba90-e006a243e7ab"
    );
  });
});
