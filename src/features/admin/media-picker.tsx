"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle, Trash2 } from "lucide-react";
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
  canDelete: boolean;
  canEdit: boolean;
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
    deleteTitle: string;
    deleteDescription: string;
    deleteInUse: string;
    deleteCancel: string;
    deleteConfirm: string;
    deleteSuccess: string;
    editTitle: string;
    edit: string;
    cancel: string;
    saveChanges: string;
    updateSuccess: string;
    updateError: string;
    discard: string;
  };
};

export function MediaLibraryClient({
  initial,
  labels,
  canDelete,
  canEdit
}: LibraryProps) {
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initial.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] =
    useState<AdminMediaAsset | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const deleteRequestInFlight = useRef(false);
  const editing = items.find((item) => item.id === editingId) ?? null;

  function onSaveMeta(formData: FormData) {
    if (!editing || !editorDirty) return;
    const text = (name: string) =>
      String(formData.get(name) ?? "").trim() || null;
    const number = (name: string) => Number(formData.get(name));
    startTransition(async () => {
      const tags = String(formData.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const payload = {
        title: text("title"),
        alt_text: text("alt_text"),
        caption: text("caption"),
        description: text("description"),
        tags,
        status: String(formData.get("status")),
        visibility: String(formData.get("visibility")),
        is_active: formData.get("is_active") === "on",
        published_at: text("published_at")
          ? new Date(String(formData.get("published_at"))).toISOString()
          : null,
        starts_at: text("starts_at")
          ? new Date(String(formData.get("starts_at"))).toISOString()
          : null,
        ends_at: text("ends_at")
          ? new Date(String(formData.get("ends_at"))).toISOString()
          : null,
        focal_x: number("focal_x"),
        focal_y: number("focal_y"),
        dominant_color: text("dominant_color"),
        display_order: number("display_order"),
        is_primary: formData.get("is_primary") === "on",
        link_url: text("link_url"),
        open_in_new_tab: formData.get("open_in_new_tab") === "on",
        placement_key: text("placement_key"),
        scope_type: text("scope_type"),
        scope_key: text("scope_key"),
        page_path: text("page_path"),
        section_key: text("section_key"),
        component_key: text("component_key"),
        locale: text("locale"),
        breakpoint: String(formData.get("breakpoint")).trim(),
        role: String(formData.get("role")).trim(),
        variant: text("variant")
      };
      const result = await upsertMediaAssetAction({
        id: editing.id,
        payload
      });
      if (!result.ok) {
        toast.error(labels.updateError);
        return;
      }
      const updated = result.data as AdminMediaAsset;
      toast.success(labels.updateSuccess);
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id ? { ...item, ...updated } : item
        )
      );
      setEditorDirty(false);
      setEditingId(null);
    });
  }

  function onDelete(item: AdminMediaAsset) {
    if (deleteRequestInFlight.current) return;
    deleteRequestInFlight.current = true;
    setDeletingId(item.id);
    startTransition(async () => {
      const result = await deleteMediaAction({ id: item.id });
      if (!result.ok) {
        toast.error(
          (item.used_by?.length ?? 0) > 0 ? labels.deleteInUse : result.message
        );
        deleteRequestInFlight.current = false;
        setDeletingId(null);
        return;
      }
      setItems((current) => current.filter((row) => row.id !== item.id));
      setDeleteCandidate(null);
      deleteRequestInFlight.current = false;
      setDeletingId(null);
      toast.success(labels.deleteSuccess);
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
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={() => setEditingId(item.id)}
                    >
                      {labels.edit}
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      aria-label={`${labels.delete}: ${item.title || item.asset_key}`}
                      disabled={pending || deletingId !== null}
                      onClick={() => setDeleteCandidate(item)}
                    >
                      <Trash2 aria-hidden="true" />
                      {labels.delete}
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editing ? (
        <form
          className="border-border bg-panel fixed inset-4 z-50 mx-auto flex max-w-3xl flex-col gap-4 overflow-y-auto rounded-md border p-4 shadow-lg sm:p-6"
          action={onSaveMeta}
          onChange={() => setEditorDirty(true)}
        >
          <h2 className="text-xl font-semibold">{labels.editTitle}</h2>
          {getPublicStorageUrl(editing.bucket_id, editing.storage_path) &&
          editing.media_type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                getPublicStorageUrl(editing.bucket_id, editing.storage_path)!
              }
              alt={editing.alt_text ?? ""}
              className="max-h-64 w-full rounded-md object-contain"
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Title
              <input
                name="title"
                defaultValue={editing.title ?? ""}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              />
            </label>
            <label className="text-sm">
              Description
              <textarea
                name="description"
                defaultValue={editing.description ?? ""}
                className="border-border mt-1 min-h-24 w-full rounded-md border px-3 py-2"
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
          </div>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 font-semibold">Publication</legend>
            <label className="text-sm">
              Status
              <select
                name="status"
                defaultValue={editing.status ?? "draft"}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <label className="text-sm">
              Visibility
              <select
                name="visibility"
                defaultValue={editing.visibility ?? "public"}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              >
                <option value="public">public</option>
                <option value="authenticated">authenticated</option>
                <option value="private">private</option>
              </select>
            </label>
            {[
              ["published_at", "Published at", editing.published_at],
              ["starts_at", "Starts at", editing.starts_at],
              ["ends_at", "Ends at", editing.ends_at]
            ].map(([name, label, value]) => (
              <label key={name as string} className="text-sm">
                {label}
                <input
                  type="datetime-local"
                  name={name as string}
                  defaultValue={value ? String(value).slice(0, 16) : ""}
                  className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
                />
              </label>
            ))}
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={editing.is_active}
              />
              Active
            </label>
          </fieldset>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 font-semibold">Presentation</legend>
            <label className="text-sm">
              Focal X
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                name="focal_x"
                defaultValue={editing.focal_x ?? 50}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              />
            </label>
            <label className="text-sm">
              Focal Y
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                name="focal_y"
                defaultValue={editing.focal_y ?? 50}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              />
            </label>
            <label className="text-sm">
              Dominant color
              <input
                name="dominant_color"
                pattern="#[0-9A-Fa-f]{6}"
                placeholder="#RRGGBB"
                defaultValue={editing.dominant_color ?? ""}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              />
            </label>
            <label className="text-sm">
              Display order
              <input
                required
                type="number"
                step="1"
                name="display_order"
                defaultValue={editing.display_order ?? 0}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              Link URL
              <input
                type="url"
                name="link_url"
                defaultValue={editing.link_url ?? ""}
                className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
              />
            </label>
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                name="is_primary"
                defaultChecked={editing.is_primary}
              />
              Primary
            </label>
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                name="open_in_new_tab"
                defaultChecked={editing.open_in_new_tab}
              />
              Open in new tab
            </label>
          </fieldset>
          <details>
            <summary className="min-h-11 cursor-pointer font-semibold">
              Advanced placement metadata
            </summary>
            <div className="grid gap-3 pt-3 sm:grid-cols-2">
              {[
                ["placement_key", "Placement key"],
                ["scope_type", "Scope type"],
                ["scope_key", "Scope key"],
                ["page_path", "Page path"],
                ["section_key", "Section key"],
                ["component_key", "Component key"],
                ["locale", "Locale"],
                ["breakpoint", "Breakpoint"],
                ["role", "Role"],
                ["variant", "Variant"]
              ].map(([name, label]) => (
                <label key={name} className="text-sm">
                  {label}
                  <input
                    name={name}
                    defaultValue={String(
                      editing[name as keyof AdminMediaAsset] ?? ""
                    )}
                    className="border-border mt-1 min-h-11 w-full rounded-md border px-3"
                  />
                </label>
              ))}
            </div>
          </details>
          <details>
            <summary className="min-h-11 cursor-pointer font-semibold">
              Storage and file information
            </summary>
            <dl className="text-muted grid gap-2 pt-3 text-sm sm:grid-cols-2">
              <div>
                <dt>Asset key</dt>
                <dd>{editing.asset_key}</dd>
              </div>
              <div>
                <dt>Storage</dt>
                <dd className="break-all">
                  {editing.bucket_id}/{editing.storage_path}
                </dd>
              </div>
              <div>
                <dt>MIME type</dt>
                <dd>{editing.mime_type ?? "—"}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{editing.byte_size ?? "—"}</dd>
              </div>
              <div>
                <dt>Dimensions</dt>
                <dd>
                  {editing.width ?? "—"} × {editing.height ?? "—"}
                </dd>
              </div>
              <div>
                <dt>Filename</dt>
                <dd>{editing.original_filename ?? "—"}</dd>
              </div>
            </dl>
          </details>
          <section>
            <h3 className="font-semibold">Usage</h3>
            {editing.used_by.length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {editing.used_by.map((entry) => (
                  <li
                    key={String(
                      entry.placement_id ?? entry.label ?? entry.kind
                    )}
                    className="border-border rounded-md border p-3"
                  >
                    {entry.label ?? entry.kind} · {String(entry.usage ?? "—")} ·{" "}
                    {String(entry.locale ?? "—")} ·{" "}
                    {String(entry.breakpoint ?? "—")} ·{" "}
                    {entry.is_primary ? "primary" : "secondary"} ·{" "}
                    {String(entry.display_order ?? "—")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Unused</p>
            )}
          </section>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending || !editorDirty}>
              {labels.saveChanges}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!editorDirty || window.confirm(labels.discard)) {
                  setEditorDirty(false);
                  setEditingId(null);
                }
              }}
            >
              {labels.cancel}
            </Button>
          </div>
        </form>
      ) : null}

      {deleteCandidate ? (
        <div
          className="bg-navy/60 fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !deletingId) {
              setDeleteCandidate(null);
            }
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingId) {
              setDeleteCandidate(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-media-title"
            aria-describedby="delete-media-description"
            className="border-border bg-panel w-full max-w-md rounded-md border p-5 shadow-lg"
          >
            <h2
              id="delete-media-title"
              className="text-ink text-lg font-semibold"
            >
              {labels.deleteTitle}
            </h2>
            <p
              id="delete-media-description"
              className="text-muted mt-2 text-sm"
            >
              {labels.deleteDescription}
            </p>
            <p className="text-ink mt-3 font-medium break-words">
              {deleteCandidate.title || deleteCandidate.asset_key}
            </p>
            {(deleteCandidate.used_by?.length ?? 0) > 0 ? (
              <p className="text-destructive mt-3 text-sm" role="status">
                {labels.deleteInUse} ({deleteCandidate.used_by?.length})
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                autoFocus
                disabled={deletingId !== null}
                onClick={() => setDeleteCandidate(null)}
              >
                {labels.deleteCancel}
              </Button>
              <Button
                type="button"
                variant="coral"
                disabled={deletingId !== null}
                onClick={() => onDelete(deleteCandidate)}
              >
                {deletingId ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 aria-hidden="true" />
                )}
                {labels.deleteConfirm}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
