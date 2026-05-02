"use client";
import { useState, useCallback } from "react";

interface UploadZoneProps {
  tenantId: string;
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: number) => void;
  onError: (error: string) => void;
}

export function UploadZone({ tenantId, onUploadComplete, onError }: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|jpg|webp)|application\/pdf$/)) {
      onError("Only JPG, PNG, WEBP images and PDF files are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError("File size must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ocr/upload", {
        method: "POST",
        headers: { "x-tenant-id": tenantId },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUploadComplete(data.fileUrl, file.name, data.fileSize);
    } catch (e: any) {
      onError(e.message);
    } finally {
      setUploading(false);
    }
  }, [tenantId, onUploadComplete, onError]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => document.getElementById("ocr-file-input")?.click()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
        dragOver ? "border-blue-500 bg-section-amber" : "border-border-subtle bg-section-muted hover:border-gray-400"
      }`}
    >
      <input
        id="ocr-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onChange}
        className="hidden"
      />
      {uploading ? (
        <p className="text-mid">Uploading...</p>
      ) : (
        <>
          <p className="text-lg font-medium text-dark">
            Drop invoice image or PDF here
          </p>
          <p className="mt-2 text-sm text-mid">
            or click to browse · JPG, PNG, WEBP, PDF · Max 10MB
          </p>
        </>
      )}
    </div>
  );
}