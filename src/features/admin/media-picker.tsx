"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteMediaAction,
  detachMediaPlacementAction,
  finalizeMediaUploadAction,
  linkMediaToScopeAction,
  prepareMediaUploadAction,
  replaceMediaPlacementAction,
  setMediaPrimaryAction,
  upsertMediaAssetAction
} from "@/server/admin/actions-cms";
import { getPublicStorageUrl } from "@/lib/media/experience-media";
import type { AdminMediaAsset } from "@/server/admin/schemas";
import type { MediaEntityType, MediaUsage } from "@/server/media/path-map";

type Props = {
  scopeType: string;
  scopeKey: string;
  role: string;
  entityId?: string;
  parentEntityId?: string | null;
  initialSelectedIds?: string[];
  libraryItems?: AdminMediaAsset[];
};

export function MediaPicker({
  scopeType,
  scopeKey,
  role,
  entityId,
  parentEntityId = null,
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
    if (!files?.[0] || !entityId) {
      toast.error("Entity context is required for upload");
      return;
    }
    const file = files[0];
    const entityType = scopeType as MediaEntityType;
    const usage = (role === "content" ? "gallery" : role) as MediaUsage;

    startTransition(async () => {
      const prepared = await prepareMediaUploadAction({
        entityType,
        entityId,
        parentEntityId,
        usage,
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        byteSize: file.size
      });
      if (!prepared.ok || !prepared.data) {
        toast.error(prepared.ok ? "Upload URL missing" : prepared.message);
        return;
      }
      const data = prepared.data as {
        signedUrl?: string;
        signed_url?: string;
        bucket: string;
        storage_path: string;
        generated_filename: string;
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
      const finalized = await finalizeMediaUploadAction({
        bucket: data.bucket as
          | "experience-media"
          | "team-media"
          | "brand-assets"
          | "admin-documents",
        storagePath: data.storage_path,
        entityType,
        entityId,
        parentEntityId,
        usage,
        originalFilename: file.name,
        generatedFilename: data.generated_filename,
        displayOrder: selectedIds.length,
        isPrimary: selectedIds.length === 0 && usage === "hero"
      });
      if (!finalized.ok) {
        toast.error(finalized.message);
        return;
      }
      const asset = (finalized.data as { asset?: AdminMediaAsset } | undefined)
        ?.asset;
      if (asset) {
        setItems((current) => [asset, ...current]);
        setSelectedIds((current) => [...current, asset.id]);
      }
      toast.success("Uploaded and linked");
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
        <Button asChild variant="outline">
          <Link href="/admin/media/upload">Open upload form</Link>
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
    detach?: string;
    setPrimary?: string;
    replace?: string;
  };
};

export function MediaLibraryClient({ initial, labels }: LibraryProps) {
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initial.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = items.find((item) => item.id === editingId) ?? null;

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
      toast.error("Media is still in use — detach placements first");
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

  function onDetach(placementId: string) {
    startTransition(async () => {
      const result = await detachMediaPlacementAction({ placementId });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(labels.detach ?? "Detached");
      window.location.reload();
    });
  }

  function onSetPrimary(placementId: string) {
    startTransition(async () => {
      const result = await setMediaPrimaryAction({ placementId });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(labels.setPrimary ?? "Set as primary");
      window.location.reload();
    });
  }

  function onReplace(entry: Record<string, unknown>, files: FileList | null) {
    const file = files?.[0];
    const placementId =
      typeof entry.placement_id === "string" ? entry.placement_id : null;
    const entityType =
      typeof entry.entity_type === "string" ? entry.entity_type : null;
    const entityId =
      typeof entry.entity_id === "string" ? entry.entity_id : null;
    const usage = typeof entry.usage === "string" ? entry.usage : null;
    if (!file || !placementId || !entityType || !entityId || !usage) {
      toast.error("Placement context is incomplete for replace");
      return;
    }

    startTransition(async () => {
      const prepared = await prepareMediaUploadAction({
        entityType: entityType as MediaEntityType,
        entityId,
        parentEntityId:
          typeof entry.parent_entity_id === "string"
            ? entry.parent_entity_id
            : null,
        usage: usage as MediaUsage,
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        byteSize: file.size
      });
      if (!prepared.ok || !prepared.data) {
        toast.error(prepared.ok ? "Upload URL missing" : prepared.message);
        return;
      }
      const data = prepared.data as {
        signedUrl?: string;
        signed_url?: string;
        bucket: string;
        storage_path: string;
        generated_filename: string;
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
      const replaced = await replaceMediaPlacementAction({
        placementId,
        bucket: data.bucket as
          | "experience-media"
          | "team-media"
          | "brand-assets"
          | "admin-documents",
        storagePath: data.storage_path,
        originalFilename: file.name,
        generatedFilename: data.generated_filename
      });
      if (!replaced.ok) {
        toast.error(replaced.message);
        return;
      }
      toast.success(labels.replace ?? "Replaced");
      window.location.reload();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild className="button-coral">
          <Link href="/admin/media/upload">{labels.upload}</Link>
        </Button>
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
                  <ul className="text-muted flex flex-col gap-1 text-xs">
                    {item.used_by.map((entry) => {
                      const placementId =
                        typeof entry.placement_id === "string"
                          ? entry.placement_id
                          : null;
                      return (
                        <li
                          key={`${entry.kind}-${entry.label ?? placementId}`}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <span>{entry.label ?? entry.kind}</span>
                          {placementId ? (
                            <>
                              <button
                                type="button"
                                className="underline"
                                disabled={pending}
                                onClick={() => onSetPrimary(placementId)}
                              >
                                {labels.setPrimary ?? "Primary"}
                              </button>
                              <button
                                type="button"
                                className="underline"
                                disabled={pending}
                                onClick={() => onDetach(placementId)}
                              >
                                {labels.detach ?? "Detach"}
                              </button>
                              <label className="inline-flex cursor-pointer underline">
                                <span>{labels.replace ?? "Replace"}</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  disabled={pending}
                                  onChange={(event) => {
                                    onReplace(entry, event.target.files);
                                    event.target.value = "";
                                  }}
                                />
                              </label>
                            </>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
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
