"use client";

import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  AdminBookingStoryDetail,
  BookingFootageUploadPolicy
} from "@/server/repositories/admin-booking-stories";
import { upsertMediaAssetAction } from "@/server/admin/actions-cms";
import {
  attachUploadedBookingStoryMediaAction,
  removeBookingStoryMediaAction,
  updateBookingStoryMediaAction
} from "@/server/admin/actions-booking-stories";

type Media = AdminBookingStoryDetail["media"][number];
type Role = Media["media_role"];

function sortMedia(items: Media[]) {
  return [...items].sort((a, b) => a.display_order - b.display_order);
}

function getMediaVersion(items: Media[]) {
  return items
    .map((item) =>
      [
        item.id,
        item.media_role,
        item.caption,
        item.display_order,
        item.is_primary,
        item.signedUrl
      ].join(":")
    )
    .join("|");
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (progress: number) => void
) {
  return new Promise<boolean>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
}

export function BookingStoryMediaManager({
  storyId,
  initialMedia,
  uploadPolicy
}: {
  storyId: string;
  initialMedia: Media[];
  uploadPolicy: BookingFootageUploadPolicy;
}) {
  const router = useRouter();
  const serverVersion = getMediaVersion(initialMedia);
  const [mediaState, setMediaState] = useState(() => ({
    version: serverVersion,
    items: sortMedia(initialMedia)
  }));
  const media =
    mediaState.version === serverVersion
      ? mediaState.items
      : sortMedia(initialMedia);
  const [progress, setProgress] = useState<number | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [failedFile, setFailedFile] = useState<File | null>(null);

  function updateMedia(next: Media[] | ((current: Media[]) => Media[])) {
    setMediaState((current) => {
      const base =
        current.version === serverVersion
          ? current.items
          : sortMedia(initialMedia);
      return {
        version: serverVersion,
        items: typeof next === "function" ? next(base) : next
      };
    });
  }

  async function persistOrder(next: Media[]) {
    updateMedia(next);
    const results = await Promise.all(
      next.map((item, index) =>
        updateBookingStoryMediaAction({
          storyId,
          mediaAssetId: item.media_asset_id,
          role: item.media_role,
          caption: item.caption ?? undefined,
          displayOrder: index
        })
      )
    );
    const failed = results.find((result) => !result.ok);
    if (failed && !failed.ok) toast.error(failed.message);
    else router.refresh();
  }

  async function upload(file: File) {
    setFailedFile(null);
    if (!uploadPolicy.allowedMimeTypes.includes(file.type)) {
      toast.error("This file type is not allowed in booking-footage");
      return;
    }
    if (file.size > uploadPolicy.fileSizeLimit) {
      toast.error("This file exceeds the booking-footage size limit");
      return;
    }
    const client = createSupabaseBrowserClient();
    if (!client) {
      toast.error("Supabase is not configured");
      return;
    }
    const extension =
      file.name
        .split(".")
        .pop()
        ?.replace(/[^a-z0-9]/gi, "") || "bin";
    const storagePath = `stories/${storyId}/${crypto.randomUUID()}.${extension.toLowerCase()}`;
    setProgress(0);
    const { data, error } = await client.storage
      .from(uploadPolicy.bucket)
      .createSignedUploadUrl(storagePath);
    if (error || !data?.signedUrl) {
      setProgress(null);
      setFailedFile(file);
      toast.error(error?.message ?? "Could not prepare upload");
      return;
    }
    const uploaded = await uploadWithProgress(
      data.signedUrl,
      file,
      setProgress
    );
    if (!uploaded) {
      setProgress(null);
      setFailedFile(file);
      toast.error("Upload failed. You can retry the file.");
      return;
    }
    const result = await attachUploadedBookingStoryMediaAction({
      storyId,
      storagePath,
      role: file.type.startsWith("video/") ? "video" : "gallery",
      displayOrder: media.length
    });
    setProgress(null);
    if (!result.ok) {
      setFailedFile(file);
      toast.error(result.message);
      return;
    }
    setFailedFile(null);
    toast.success("Media uploaded");
    router.refresh();
  }

  return (
    <section className="border-border rounded-[var(--radius)] border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-ink text-xl font-semibold">Media manager</h2>
          <p className="text-muted text-sm">
            JPEG, PNG, WebP, AVIF, MP4 or WebM. Maximum{" "}
            {Math.round(uploadPolicy.fileSizeLimit / 1024 / 1024)} MiB.
          </p>
        </div>
        <label className="button button-coral min-h-11 cursor-pointer">
          <Upload className="size-4" aria-hidden />
          Upload footage
          <input
            type="file"
            className="sr-only"
            accept={uploadPolicy.allowedMimeTypes.join(",")}
            disabled={progress !== null}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      {progress !== null ? (
        <div className="mt-4" role="status" aria-live="polite">
          <div className="bg-panel h-2 overflow-hidden rounded-full">
            <div
              className="bg-turquoise h-full transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted mt-1 text-sm">Uploading {progress}%</p>
        </div>
      ) : null}
      {failedFile && progress === null ? (
        <div
          className="border-border mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
          role="alert"
        >
          <p className="text-muted min-w-0 truncate text-sm">
            Upload failed: {failedFile.name}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => void upload(failedFile)}
          >
            Retry upload
          </Button>
        </div>
      ) : null}
      {media.length === 0 ? (
        <p className="text-muted mt-5">No media has been attached.</p>
      ) : (
        <ul className="mt-5 grid gap-4">
          {media.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={(event) =>
                event.dataTransfer.setData("text/plain", String(index))
              }
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const from = Number(event.dataTransfer.getData("text/plain"));
                if (!Number.isInteger(from) || from === index) return;
                const next = [...media];
                const [moved] = next.splice(from, 1);
                next.splice(index, 0, moved);
                void persistOrder(next);
              }}
              className="border-border grid gap-3 rounded-md border p-3 sm:grid-cols-[7rem_1fr_auto]"
            >
              <div className="bg-panel relative aspect-video overflow-hidden rounded-sm">
                {item.signedUrl && item.asset.mediaType === "video" ? (
                  <video
                    src={item.signedUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : item.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.signedUrl}
                    alt={item.asset.altText ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                {item.is_primary ? (
                  <span className="bg-gold text-navy absolute top-2 left-2 rounded-sm px-2 py-1 text-xs font-semibold">
                    Primary cover
                  </span>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label className="text-sm">
                  Role
                  <select
                    value={item.media_role}
                    disabled={item.is_primary}
                    className="border-input mt-1 block min-h-11 w-full rounded-md border px-3"
                    onChange={async (event) => {
                      const role = event.target.value as Role;
                      const result = await updateBookingStoryMediaAction({
                        storyId,
                        mediaAssetId: item.media_asset_id,
                        role,
                        caption: item.caption ?? undefined,
                        displayOrder: index
                      });
                      if (!result.ok) toast.error(result.message);
                      else {
                        updateMedia((current) =>
                          current.map((row) => ({
                            ...row,
                            media_role:
                              row.id === item.id ? role : row.media_role,
                            is_primary:
                              role === "cover"
                                ? row.id === item.id
                                : row.id === item.id
                                  ? false
                                  : row.is_primary
                          }))
                        );
                        router.refresh();
                      }
                    }}
                  >
                    {(
                      [
                        "cover",
                        "gallery",
                        "highlight",
                        "video",
                        "thumbnail"
                      ] as const
                    ).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {item.is_primary ? (
                    <span className="text-muted mt-1 block text-xs">
                      Select another cover before changing this media role.
                    </span>
                  ) : null}
                </label>
                <label className="text-sm">
                  Caption
                  <input
                    defaultValue={item.caption ?? ""}
                    className="border-input mt-1 min-h-11 w-full rounded-md border px-3"
                    onBlur={async (event) => {
                      const caption = event.currentTarget.value.trim();
                      const result = await updateBookingStoryMediaAction({
                        storyId,
                        mediaAssetId: item.media_asset_id,
                        role: item.media_role,
                        caption,
                        displayOrder: index
                      });
                      if (!result.ok) toast.error(result.message);
                      else {
                        updateMedia((current) =>
                          current.map((row) =>
                            row.id === item.id
                              ? {
                                  ...row,
                                  caption: caption || null
                                }
                              : row
                          )
                        );
                      }
                    }}
                  />
                </label>
                <label className="text-sm">
                  Public alt text
                  <input
                    defaultValue={item.asset.altText ?? ""}
                    className="border-input mt-1 min-h-11 w-full rounded-md border px-3"
                    onBlur={async (event) => {
                      const altText = event.currentTarget.value.trim();
                      const result = await upsertMediaAssetAction({
                        id: item.media_asset_id,
                        payload: { alt_text: altText || null }
                      });
                      if (!result.ok) toast.error(result.message);
                      else {
                        updateMedia((current) =>
                          current.map((row) =>
                            row.id === item.id
                              ? {
                                  ...row,
                                  asset: {
                                    ...row.asset,
                                    altText: altText || null
                                  }
                                }
                              : row
                          )
                        );
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex items-start gap-1">
                <Button
                  type="button"
                  variant="outline"
                  className="size-11 p-0"
                  disabled={index === 0}
                  aria-label="Move media up"
                  onClick={() => {
                    const next = [...media];
                    [next[index - 1], next[index]] = [
                      next[index],
                      next[index - 1]
                    ];
                    void persistOrder(next);
                  }}
                >
                  <ArrowUp aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="size-11 p-0"
                  disabled={index === media.length - 1}
                  aria-label="Move media down"
                  onClick={() => {
                    const next = [...media];
                    [next[index + 1], next[index]] = [
                      next[index],
                      next[index + 1]
                    ];
                    void persistOrder(next);
                  }}
                >
                  <ArrowDown aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="coral"
                  className="size-11 p-0"
                  disabled={pendingId === item.id}
                  aria-label="Remove media"
                  onClick={async () => {
                    setPendingId(item.id);
                    const result = await removeBookingStoryMediaAction(
                      storyId,
                      item.media_asset_id
                    );
                    setPendingId(null);
                    if (!result.ok) toast.error(result.message);
                    else {
                      updateMedia((current) =>
                        current.filter((row) => row.id !== item.id)
                      );
                      router.refresh();
                    }
                  }}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
