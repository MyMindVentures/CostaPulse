"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  finalizeMediaUploadAction,
  prepareMediaUploadAction
} from "@/server/admin/actions-cms";
import {
  MEDIA_ENTITY_TYPES,
  MEDIA_USAGES,
  isUsageAllowed,
  resolveMediaDestination,
  usagesForEntity,
  type MediaEntityType,
  type MediaUsage
} from "@/server/media/path-map";
import { getPublicStorageUrl } from "@/lib/media/experience-media";
import type { AdminReferenceData } from "@/server/admin/schemas";

type SelectorItem = {
  id: string;
  label: string;
  slug: string;
  status?: string;
  parentId?: string | null;
};

type QueueItem = {
  id: string;
  file: File;
  previewUrl: string | null;
  progress: number | null;
  error: string | null;
  done: boolean;
};

type Props = {
  reference: AdminReferenceData;
  labels: {
    title: string;
    description: string;
    entityType: string;
    entity: string;
    parentExperience: string;
    usage: string;
    altText: string;
    caption: string;
    sortOrder: string;
    primary: string;
    destination: string;
    dropHint: string;
    upload: string;
    uploading: string;
    success: string;
    uploadAnother: string;
    viewLibrary: string;
    remove: string;
    status: string;
  };
};

function mapSelectors(reference: AdminReferenceData): {
  experiences: SelectorItem[];
  variants: SelectorItem[];
  locations: SelectorItem[];
  teamMembers: SelectorItem[];
  partners: SelectorItem[];
  siteSections: SelectorItem[];
} {
  return {
    experiences: (reference.experiences ?? []).map((item) => ({
      id: item.id,
      label: item.title ?? item.name ?? item.slug,
      slug: item.slug,
      status: String(item.status)
    })),
    variants: (reference.variants ?? []).map((item) => ({
      id: item.id,
      label: item.name,
      slug: item.slug,
      status: item.is_active ? "active" : "inactive",
      parentId: item.experience_id
    })),
    locations: (reference.locations ?? []).map((item) => ({
      id: item.id,
      label: item.name,
      slug: item.slug ?? item.name,
      status: item.is_active ? "active" : "inactive"
    })),
    teamMembers: (reference.team_members ?? []).map((item) => ({
      id: item.id,
      label: item.display_name ?? item.name ?? item.slug ?? item.id,
      slug: item.slug ?? item.id,
      status: item.is_active ? "active" : "inactive"
    })),
    partners: (reference.partners ?? []).map((item) => ({
      id: item.id,
      label: item.name,
      slug: item.slug ?? item.name,
      status: String(item.status)
    })),
    siteSections: (reference.site_content_sections ?? []).map((item) => ({
      id: item.id,
      label: item.label ?? item.name ?? item.section_key ?? item.id,
      slug: item.section_key ?? item.slug ?? item.id,
      status: item.is_active === false ? "inactive" : "active"
    }))
  };
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (value: number) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
}

export function MediaUploadForm({ reference, labels }: Props) {
  const selectors = useMemo(() => mapSelectors(reference), [reference]);
  const [pending, startTransition] = useTransition();
  const [entityType, setEntityType] = useState<MediaEntityType>("experience");
  const [parentExperienceId, setParentExperienceId] = useState("");
  const [entityId, setEntityId] = useState("");
  const [usage, setUsage] = useState<MediaUsage>("gallery");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPrimary, setIsPrimary] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [success, setSuccess] = useState<{
    url: string | null;
    entityLabel: string;
    usage: string;
    mediaType: string;
  } | null>(null);

  const allowedUsages = usagesForEntity(entityType);

  const entityOptions = useMemo(() => {
    switch (entityType) {
      case "experience":
        return selectors.experiences;
      case "experience_variant":
        return selectors.variants.filter(
          (item) => item.parentId === parentExperienceId
        );
      case "location":
        return selectors.locations;
      case "team_member":
        return selectors.teamMembers.filter((item) => item.status === "active");
      case "partner":
        return selectors.partners;
      case "site_content":
        return selectors.siteSections;
      default:
        return [];
    }
  }, [entityType, parentExperienceId, selectors]);

  const selectedEntity = entityOptions.find((item) => item.id === entityId);
  const parentExperience = selectors.experiences.find(
    (item) => item.id === parentExperienceId
  );

  const destinationPreview = useMemo(() => {
    if (!selectedEntity) return null;
    if (!isUsageAllowed(entityType, usage)) return null;
    try {
      return resolveMediaDestination({
        entityType,
        usage,
        entitySlug: selectedEntity.slug,
        parentSlug: parentExperience?.slug,
        sectionKey: selectedEntity.slug,
        originalFilename: queue[0]?.file.name ?? "preview.jpg",
        mimeType: queue[0]?.file.type || "image/jpeg",
        uniqueSuffix: "preview"
      });
    } catch {
      return null;
    }
  }, [entityType, usage, selectedEntity, parentExperience, queue]);

  function resetEntityFields(nextType: MediaEntityType) {
    setEntityType(nextType);
    setEntityId("");
    setParentExperienceId("");
    const nextUsages = usagesForEntity(nextType);
    setUsage(nextUsages[0] ?? "gallery");
    setIsPrimary(nextUsages[0] === "hero" || nextUsages[0] === "avatar");
  }

  function onFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;
    const allowMultiple = usage === "gallery";
    const files = Array.from(fileList).slice(0, allowMultiple ? 20 : 1);
    setQueue(
      files.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}-${Date.now()}`,
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        progress: null,
        error: null,
        done: false
      }))
    );
    setSuccess(null);
  }

  function removeQueued(id: string) {
    setQueue((current) => {
      const next = current.filter((item) => item.id !== id);
      const removed = current.find((item) => item.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }

  function moveQueued(id: string, direction: -1 | 1) {
    setQueue((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  }

  function onSubmit() {
    if (!selectedEntity || queue.length === 0) {
      toast.error("Select an entity and at least one file");
      return;
    }
    if (entityType === "experience_variant" && !parentExperienceId) {
      toast.error("Select a parent experience first");
      return;
    }

    startTransition(async () => {
      let lastSuccess: typeof success = null;
      for (let index = 0; index < queue.length; index += 1) {
        const item = queue[index];
        setQueue((current) =>
          current.map((row) =>
            row.id === item.id ? { ...row, progress: 0, error: null } : row
          )
        );

        const prepared = await prepareMediaUploadAction({
          entityType,
          entityId,
          parentEntityId: parentExperienceId || null,
          usage,
          originalFilename: item.file.name,
          mimeType: item.file.type || "application/octet-stream",
          byteSize: item.file.size
        });

        if (!prepared.ok || !prepared.data) {
          const message = prepared.ok
            ? "Upload preparation failed"
            : prepared.message;
          setQueue((current) =>
            current.map((row) =>
              row.id === item.id
                ? { ...row, progress: null, error: message }
                : row
            )
          );
          toast.error(message);
          continue;
        }

        const prep = prepared.data as {
          signedUrl?: string;
          signed_url?: string;
          bucket: string;
          storage_path: string;
          generated_filename: string;
          entity_id?: string;
          parent_entity_id?: string | null;
        };
        const uploadUrl = prep.signedUrl ?? prep.signed_url;
        if (!uploadUrl) {
          setQueue((current) =>
            current.map((row) =>
              row.id === item.id
                ? { ...row, progress: null, error: "Missing signed URL" }
                : row
            )
          );
          continue;
        }

        const uploaded = await uploadWithProgress(
          uploadUrl,
          item.file,
          (value) => {
            setQueue((current) =>
              current.map((row) =>
                row.id === item.id ? { ...row, progress: value } : row
              )
            );
          }
        );

        if (!uploaded) {
          setQueue((current) =>
            current.map((row) =>
              row.id === item.id
                ? { ...row, progress: null, error: "Upload failed" }
                : row
            )
          );
          toast.error("Upload failed");
          continue;
        }

        const finalized = await finalizeMediaUploadAction({
          bucket: prep.bucket as
            | "experience-media"
            | "team-media"
            | "brand-assets"
            | "admin-documents",
          storagePath: prep.storage_path,
          entityType,
          entityId,
          parentEntityId: parentExperienceId || null,
          usage,
          originalFilename: item.file.name,
          generatedFilename: prep.generated_filename,
          altText,
          caption,
          displayOrder: sortOrder + index,
          isPrimary: isPrimary && index === 0,
          width: null,
          height: null,
          durationSeconds: null
        });

        if (!finalized.ok) {
          setQueue((current) =>
            current.map((row) =>
              row.id === item.id
                ? {
                    ...row,
                    progress: null,
                    error: finalized.message
                  }
                : row
            )
          );
          toast.error(finalized.message);
          continue;
        }

        setQueue((current) =>
          current.map((row) =>
            row.id === item.id
              ? { ...row, progress: 100, done: true, error: null }
              : row
          )
        );

        lastSuccess = {
          url: getPublicStorageUrl(prep.bucket, prep.storage_path),
          entityLabel: selectedEntity.label,
          usage,
          mediaType: item.file.type.startsWith("video/") ? "video" : "image"
        };
      }

      if (lastSuccess) {
        setSuccess(lastSuccess);
        toast.success(labels.success);
      }
    });
  }

  if (success) {
    return (
      <div className="border-border bg-panel flex flex-col gap-4 rounded-md border p-6">
        <h2 className="text-ink text-xl font-semibold">{labels.success}</h2>
        {success.url && success.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={success.url}
            alt={altText || success.entityLabel}
            className="max-h-72 w-full rounded-md object-cover"
          />
        ) : (
          <p className="text-muted text-sm">
            {success.entityLabel} · {success.usage}
          </p>
        )}
        <p className="text-sm">
          Linked to <strong>{success.entityLabel}</strong> as{" "}
          <Badge>{success.usage}</Badge>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              setSuccess(null);
              setQueue([]);
            }}
          >
            {labels.uploadAnother}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/media">{labels.viewLibrary}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!pending) onSubmit();
      }}
    >
      <header>
        <h1 className="text-ink text-3xl font-semibold">{labels.title}</h1>
        <p className="text-muted mt-2 max-w-2xl">{labels.description}</p>
      </header>

      <div
        className="border-border bg-sand/30 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-8 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFilesSelected(event.dataTransfer.files);
        }}
      >
        <p className="text-sm font-medium">{labels.dropHint}</p>
        <label className="button button-outline mt-4 inline-flex min-h-11 cursor-pointer items-center px-4">
          Browse files
          <input
            type="file"
            className="sr-only"
            multiple={usage === "gallery"}
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,application/pdf"
            onChange={(event) => onFilesSelected(event.target.files)}
          />
        </label>
      </div>

      {queue.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {queue.map((item, index) => (
            <li
              key={item.id}
              className="border-border flex flex-wrap items-center gap-3 rounded-md border p-3"
            >
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt=""
                  className="size-16 rounded object-cover"
                />
              ) : (
                <div className="bg-sand/50 text-muted flex size-16 items-center justify-center rounded text-xs uppercase">
                  {item.file.type.split("/")[0] || "file"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p className="text-muted text-xs">
                  {(item.file.size / 1024).toFixed(0)} KB
                  {item.progress !== null ? ` · ${item.progress}%` : null}
                  {item.error ? ` · ${item.error}` : null}
                </p>
              </div>
              {usage === "gallery" ? (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={index === 0 || pending}
                    onClick={() => moveQueued(item.id, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={index === queue.length - 1 || pending}
                    onClick={() => moveQueued(item.id, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => removeQueued(item.id)}
              >
                {labels.remove}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          {labels.entityType}
          <select
            className="border-border bg-panel mt-1 min-h-11 w-full rounded-md border px-3"
            value={entityType}
            onChange={(event) =>
              resetEntityFields(event.target.value as MediaEntityType)
            }
          >
            {MEDIA_ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        {entityType === "experience_variant" ? (
          <label className="text-sm">
            {labels.parentExperience}
            <select
              className="border-border bg-panel mt-1 min-h-11 w-full rounded-md border px-3"
              value={parentExperienceId}
              onChange={(event) => {
                setParentExperienceId(event.target.value);
                setEntityId("");
              }}
              required
            >
              <option value="">Select experience</option>
              {selectors.experiences.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.status})
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="text-sm">
          {labels.entity}
          <select
            className="border-border bg-panel mt-1 min-h-11 w-full rounded-md border px-3"
            value={entityId}
            onChange={(event) => setEntityId(event.target.value)}
            required
            disabled={
              entityType === "experience_variant" && !parentExperienceId
            }
          >
            <option value="">Select…</option>
            {entityOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {item.status ? ` · ${item.status}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          {labels.usage}
          <select
            className="border-border bg-panel mt-1 min-h-11 w-full rounded-md border px-3"
            value={usage}
            onChange={(event) => {
              const next = event.target.value as MediaUsage;
              setUsage(next);
              if (next !== "gallery" && queue.length > 1) {
                setQueue((current) => current.slice(0, 1));
              }
            }}
          >
            {MEDIA_USAGES.map((option) => (
              <option
                key={option}
                value={option}
                disabled={!allowedUsages.includes(option)}
              >
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          {labels.altText}
          <input
            className="border-border bg-panel mt-1 min-h-11 w-full rounded-md border px-3"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
          />
        </label>

        <label className="text-sm">
          {labels.caption}
          <input
            className="border-border bg-panel mt-1 min-h-11 w-full rounded-md border px-3"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
        </label>

        <label className="text-sm">
          {labels.sortOrder}
          <input
            type="number"
            min={0}
            className="border-border bg-panel mt-1 min-h-11 w-full rounded-md border px-3"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
          />
        </label>

        <label className="flex min-h-11 items-center gap-3 text-sm md:mt-6">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(event) => setIsPrimary(event.target.checked)}
          />
          {labels.primary}
        </label>
      </div>

      {destinationPreview ? (
        <p className="text-muted text-sm" aria-live="polite">
          {labels.destination}:{" "}
          <span className="text-ink font-medium">
            {destinationPreview.humanLabel}
            {destinationPreview.generatedFilename}
          </span>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={pending || queue.length === 0 || !entityId}
        >
          {pending ? labels.uploading : labels.upload}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/media">{labels.viewLibrary}</Link>
        </Button>
      </div>
    </form>
  );
}
