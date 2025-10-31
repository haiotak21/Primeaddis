"use client";
import React, { useRef } from "react";

export interface FileUploadProps {
  id?: string;
  eventName?: string; // CustomEvent name to dispatch with selected files
  multiple?: boolean;
  maxFiles?: number; // Optional client-side cap (e.g., 10)
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  eventName = "file-upload:change",
  multiple = true,
  maxFiles,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files ? Array.from(e.target.files) : [];
    if (
      typeof maxFiles === "number" &&
      maxFiles > 0 &&
      files.length > maxFiles
    ) {
      // Trim to max and provide a subtle alert; consumers can also validate downstream
      files = files.slice(0, maxFiles);
      try {
        // Best-effort notification; avoid coupling to any specific UI lib
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-alert
          window.alert(`You can upload up to ${maxFiles} image(s) at a time.`);
        }
      } catch {}
    }
    // Dispatch a serializable event with files in detail; note: File objects are not serializable
    // but events are only observed on the client side. We keep props serializable by not passing functions.
    window.dispatchEvent(
      new CustomEvent(eventName, { detail: { id, files } as any })
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-48 cursor-pointer border border-dashed rounded-md"
      onClick={() => inputRef.current?.click()}
      style={{ minHeight: 192 }}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleFiles}
      />
      <div className="flex flex-col items-center px-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-400 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          Click to select or drop image(s){" "}
          {typeof maxFiles === "number" && maxFiles > 0
            ? `• up to ${maxFiles}`
            : ""}
        </span>
      </div>
    </div>
  );
};
