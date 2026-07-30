"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ProtectedFilePreviewProps = {
  fileId: string;
  fileName: string;
  mimeType: string;
  className?: string;
};

export function ProtectedFilePreview({
  fileId,
  fileName,
  mimeType,
  className = "h-[22rem] w-full"
}: ProtectedFilePreviewProps) {
  const [loadedFile, setLoadedFile] = useState<{
    requestUrl: string;
    blobUrl: string | null;
    blob: Blob | null;
    mimeType: string;
    error: string | null;
  } | null>(null);
  const [renderedPdf, setRenderedPdf] = useState<{
    blob: Blob;
    pageImages: string[];
    error: string | null;
  } | null>(null);

  const previewUrl = useMemo(
    () => `/api/admin/documents/files/${fileId}?intent=view`,
    [fileId]
  );
  const currentFile = loadedFile?.requestUrl === previewUrl ? loadedFile : null;
  const blobUrl = currentFile?.blobUrl ?? null;
  const blob = currentFile?.blob ?? null;
  const resolvedMimeType = currentFile?.mimeType ?? mimeType;
  const loadError = currentFile?.error ?? null;
  const currentPdf = renderedPdf?.blob === blob ? renderedPdf : null;
  const pdfPageImages = currentPdf?.pageImages ?? [];
  const pdfRenderError = currentPdf?.error ?? null;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let objectUrl: string | null = null;

    async function load() {
      try {
        const response = await fetch(previewUrl, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Preview failed (${response.status})`);
        }

        const loadedBlob = await response.blob();
        if (!active) {
          return;
        }

        objectUrl = URL.createObjectURL(loadedBlob);
        setLoadedFile({
          requestUrl: previewUrl,
          blobUrl: objectUrl,
          blob: loadedBlob,
          mimeType: loadedBlob.type || mimeType,
          error: null
        });
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setLoadedFile({
          requestUrl: previewUrl,
          blobUrl: null,
          blob: null,
          mimeType,
          error: error instanceof Error ? error.message : "Preview failed"
        });
      }
    }

    load();

    return () => {
      active = false;
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [previewUrl, mimeType]);

  useEffect(() => {
    if (resolvedMimeType !== "application/pdf" || !blob) {
      return;
    }

    let active = true;
    const currentBlob = blob;

    async function renderPdf() {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        const bytes = await currentBlob.arrayBuffer();
        const task = pdfjs.getDocument({ data: bytes });
        const pdfDocument = await task.promise;

        const renderedPages: string[] = [];
        for (
          let pageNumber = 1;
          pageNumber <= pdfDocument.numPages;
          pageNumber++
        ) {
          const page = await pdfDocument.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.4 });
          const canvas = window.document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Failed to prepare PDF canvas context");
          }

          await page.render({ canvasContext: context, viewport, canvas })
            .promise;
          renderedPages.push(canvas.toDataURL("image/png"));
        }

        if (!active) {
          return;
        }

        setRenderedPdf({
          blob: currentBlob,
          pageImages: renderedPages,
          error: null
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setRenderedPdf({
          blob: currentBlob,
          pageImages: [],
          error: error instanceof Error ? error.message : "PDF preview failed"
        });
      }
    }

    renderPdf();

    return () => {
      active = false;
    };
  }, [resolvedMimeType, blob]);

  if (loadError) {
    return (
      <div className="text-navy/70 flex h-[22rem] items-center justify-center p-4 text-sm">
        Inline preview is niet beschikbaar ({loadError}).
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="text-navy/70 flex h-[22rem] items-center justify-center p-4 text-sm">
        Preview laden...
      </div>
    );
  }

  if (resolvedMimeType.startsWith("image/")) {
    return (
      <Image
        src={blobUrl}
        alt={fileName}
        width={1200}
        height={880}
        unoptimized
        loading="lazy"
        className={`${className} object-contain`}
      />
    );
  }

  if (resolvedMimeType === "application/pdf") {
    if (pdfPageImages.length === 0) {
      return (
        <div className={`${className} bg-white`}>
          <iframe
            src={blobUrl}
            title={`Preview ${fileName}`}
            className="h-full w-full border-0"
          />
          {pdfRenderError ? (
            <p className="sr-only">
              PDF.js preview is niet beschikbaar ({pdfRenderError}). De
              ingebouwde PDF-viewer wordt gebruikt.
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div className={`${className} overflow-y-auto bg-white p-2`}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {pdfPageImages.map((pageImage, index) => (
            <Image
              key={`${fileId}-page-${index + 1}`}
              src={pageImage}
              alt={`${fileName} pagina ${index + 1}`}
              width={1200}
              height={1700}
              unoptimized
              className="h-auto w-full rounded border border-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (resolvedMimeType.startsWith("video/")) {
    return (
      <video src={blobUrl} controls className={className} preload="metadata" />
    );
  }

  if (resolvedMimeType.startsWith("audio/")) {
    return (
      <div className="flex h-[22rem] items-center justify-center p-4">
        <audio
          src={blobUrl}
          controls
          preload="metadata"
          className="w-full max-w-md"
        />
      </div>
    );
  }

  if (resolvedMimeType.startsWith("text/")) {
    return (
      <iframe
        src={blobUrl}
        title={`Preview ${fileName}`}
        loading="lazy"
        className={className}
      />
    );
  }

  return (
    <object data={blobUrl} type={resolvedMimeType} className={className}>
      <div className="text-navy/70 flex h-[22rem] items-center justify-center p-4 text-sm">
        Inline preview is niet beschikbaar voor dit bestandstype.
      </div>
    </object>
  );
}
