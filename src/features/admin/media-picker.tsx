"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createSignedUploadAction,
  deleteMediaAction,
  linkMediaToScopeAction,
  upsertMediaAssetAction
} from "@/server/admin/actions-cms";
import { getPublicStorageUrl } from "@/lib/media/experience-media";
import type { AdminMediaAsset } from "@/server/admin/schemas";

type Props = {
  scopeType: string;
  scopeKey: string;
  role: string;
  initialSelectedIds?: string[];
  libraryItems?: AdminMediaAsset[];
};

export function MediaPicker({
  scopeType,
  scopeKey,
  role,
  initialSelectedIds = [],
  libraryItems = []
}: Props) {
  const [pending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [items, setItems] = useState<AdminMediaAsset[]>(libraryItems);

  const selected = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  }

  function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const bucket =
      scopeType === "team_member"
        ? "team-media"
        : scopeType === "partner"
          ? "brand-assets"
          : "experience-media";
    const folder =
      scopeType === "partner"
        ? `partners/${scopeKey}`
        : scopeType === "team_member"
          ? scopeKey
          : scopeKey;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${folder}/${Date.now()}-${safeName}`;

    startTransition(async () => {
      const signed = await createSignedUploadAction({ bucket, path });
      if (!signed.ok || !signed.data) {
        toast.error(signed.ok ? "Upload URL missing" : signed.message);
        return;
      }
      const data = signed.data as {
        signedUrl?: string;
        signed_url?: string;
        token?: string;
        path?: string;
      };
      const uploadUrl = data.signedUrl ?? data.signed_url;
      if (!uploadUrl) {
        toast.error("Signed upload URL missing");
        return;
      }
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream"
        },
        body: file
      });
      if (!response.ok) {
        toast.error("Upload failed");
        return;
      }
      toast.success("Uploaded — refresh to see new assets");
    });
  }

  function onSaveLink() {
    startTransition(async () => {
      const result = await linkMediaToScopeAction({
        scopeType,
        scopeKey,
        role,
        items: selectedIds.map((id, index) => ({
          id,
          display_order: index,
          is_primary: index === 0,
          placement_key: role
        }))
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Media linked");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="button button-outline inline-flex min-h-11 cursor-pointer items-center px-4">
          Upload
          <input
            type="file"
            className="sr-only"
            accept="image/*,video/mp4,video/webm,application/pdf"
            onChange={(event) => onUpload(event.target.files)}
          />
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onSaveLink()}
        >
          Save gallery link
        </Button>
      </div>

      {selected.length > 0 ? (
        <p className="text-muted text-sm">{selected.length} selected</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const url = getPublicStorageUrl(item.bucket_id, item.storage_path);
          const checked = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`border-border overflow-hidden rounded-md border text-left ${checked ? "ring-turquoise ring-2" : ""}`}
              onClick={() => toggle(item.id)}
            >
              <div className="bg-sand/40 relative aspect-[4/3]">
                {item.media_type === "image" && url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={item.alt_text ?? item.title ?? item.asset_key}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="text-muted flex size-full items-center justify-center text-sm uppercase">
                    {item.media_type}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3 text-sm">
                <span className="font-medium">
                  {item.title || item.asset_key}
                </span>
                <span className="text-muted truncate">{item.storage_path}</span>
              </div>
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="text-muted text-sm">
          Open the media library to upload assets, then return here to link
          them. You can also upload directly above.
        </p>
      ) : null}

      {/* Keep setters available for parent refreshes */}
      <span className="sr-only">{setItems.length}</span>
    </div>
  );
}

type LibraryProps = {
  initial: {
    items: AdminMediaAsset[];
    page: number;
    page_size: number;
    total: number;
  };
  labels: {
    upload: string;
    delete: string;
    save: string;
    search: string;
    filterType: string;
    filterUsage: string;
    used: string;
    unused: string;
    all: string;
  };
};

export function MediaLibraryClient({ initial, labels }: LibraryProps) {
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initial.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const editing = items.find((item) => item.id === editingId) ?? null;

  function onUpload(files: FileList | null) {
    if (!files?.[0]) return;
    const file = files[0];
    const bucket =
      file.type.startsWith("image/") || file.type.startsWith("video/")
        ? "experience-media"
        : "brand-assets";
    const folder = bucket === "brand-assets" ? "website" : "library";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${folder}/${Date.now()}-${safeName}`;

    startTransition(async () => {
      const signed = await createSignedUploadAction({ bucket, path });
      if (!signed.ok || !signed.data) {
        toast.error(signed.ok ? "Upload URL missing" : signed.message);
        return;
      }
      const data = signed.data as { signedUrl?: string; signed_url?: string };
      const uploadUrl = data.signedUrl ?? data.signed_url;
      if (!uploadUrl) {
        toast.error("Signed upload URL missing");
        return;
      }

      setUploadProgress(0);
      const ok = await new Promise<boolean>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || "application/octet-stream"
        );
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
        xhr.onerror = () => resolve(false);
        xhr.send(file);
      });
      setUploadProgress(null);
      if (!ok) {
        toast.error("Upload failed");
        return;
      }
      toast.success("Uploaded. Reload to sync metadata.");
      window.location.reload();
    });
  }

  function onSaveMeta(formData: FormData) {
    if (!editing) return;
    startTransition(async () => {
      const tags = String(formData.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const result = await upsertMediaAssetAction({
        id: editing.id,
        payload: {
          title: String(formData.get("title") ?? ""),
          alt_text: String(formData.get("alt_text") ?? ""),
          caption: String(formData.get("caption") ?? ""),
          tags,
          status: "published",
          visibility: "public"
        }
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(labels.save);
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                title: String(formData.get("title") ?? ""),
                alt_text: String(formData.get("alt_text") ?? ""),
                caption: String(formData.get("caption") ?? ""),
                tags
              }
            : item
        )
      );
      setEditingId(null);
    });
  }

  function onDelete(item: AdminMediaAsset) {
    if ((item.used_by?.length ?? 0) > 0) {
      toast.error("Media is still in use");
      return;
    }
    if (!window.confirm("Delete this media asset permanently?")) return;
    startTransition(async () => {
      const result = await deleteMediaAction({ id: item.id });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setItems((current) => current.filter((row) => row.id !== item.id));
      toast.success(labels.delete);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="button button-coral inline-flex min-h-11 cursor-pointer items-center px-4">
          {labels.upload}
          <input
            type="file"
            className="sr-only"
            accept="image/*,video/mp4,video/webm,application/pdf"
            onChange={(event) => onUpload(event.target.files)}
          />
        </label>
        {uploadProgress !== null ? (
          <p className="text-muted text-sm" aria-live="polite">
            Uploading… {uploadProgress}%
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const url = getPublicStorageUrl(item.bucket_id, item.storage_path);
          const used = (item.used_by?.length ?? 0) > 0;
          return (
            <article
              key={item.id}
              className="border-border overflow-hidden rounded-md border"
            >
              <div className="bg-sand/40 relative aspect-[4/3]">
                {item.media_type === "image" && url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={item.alt_text ?? item.title ?? item.asset_key}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="text-muted flex size-full items-center justify-center text-sm uppercase">
                    {item.media_type}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {item.title || item.asset_key}
                    </p>
                    <p className="text-muted text-xs">
                      {item.width && item.height
                        ? `${item.width}×${item.height}`
                        : null}
                      {item.byte_size
                        ? ` · ${Math.round(item.byte_size / 1024)} KB`
                        : null}
                    </p>
                  </div>
                  <Badge variant={used ? "default" : "outline"}>
                    {used ? labels.used : labels.unused}
                  </Badge>
                </div>
                {item.used_by && item.used_by.length > 0 ? (
                  <p className="text-muted text-xs">
                    {item.used_by
                      .map((entry) => entry.label ?? entry.kind)
                      .join(", ")}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setEditingId(item.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending || used}
                    onClick={() => onDelete(item)}
                  >
                    {labels.delete}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editing ? (
        <form
          className="border-border bg-panel fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg flex-col gap-3 rounded-md border p-4 shadow-lg md:inset-x-auto"
          action={onSaveMeta}
        >
          <h2 className="font-semibold">Edit media</h2>
          <label className="text-sm">
            Title
            <input
              name="title"
              defaultValue={editing.title ?? ""}
              className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <label className="text-sm">
            Alt text
            <input
              name="alt_text"
              defaultValue={editing.alt_text ?? ""}
              className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <label className="text-sm">
            Caption
            <input
              name="caption"
              defaultValue={editing.caption ?? ""}
              className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <label className="text-sm">
            Tags (comma separated)
            <input
              name="tags"
              defaultValue={(editing.tags ?? []).join(", ")}
              className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {labels.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
