// Preconfigured storage helpers for Manus WebDev templates
// Uses Cloudinary when CLOUDINARY_URL is set, otherwise falls back to the Forge storage proxy

import { ENV } from "./_core/env";
import { logger } from "./_core/logger";
import { v2 as cloudinary } from "cloudinary";

type StorageConfig = { baseUrl: string; apiKey: string };

const MAX_UPLOAD_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES || "5242880", 10);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const CLOUDINARY_ENABLED = Boolean(ENV.cloudinaryUrl);
let cloudinaryConfigured = false;

function ensureCloudinaryConfigured(): boolean {
  if (!CLOUDINARY_ENABLED) return false;

  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloudinary_url: ENV.cloudinaryUrl,
      secure: true,
    });
    cloudinaryConfigured = true;
  }

  return true;
}

function toCloudinaryPublicId(relKey: string): string {
  return normalizeKey(relKey).replace(/\.[^/.]+$/, "");
}

function resolveResourceType(contentType: string): "image" | "video" | "raw" {
  if (contentType?.startsWith("image/")) return "image";
  if (contentType?.startsWith("video/")) return "video";
  return "raw";
}

function resourceTypeFromKey(relKey: string): "image" | "video" | "raw" {
  const ext = normalizeKey(relKey).split(".").pop()?.toLowerCase();
  if (!ext) return "raw";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (["mp4", "mov", "mkv", "webm"].includes(ext)) return "video";
  return "raw";
}

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
  meta?: { actorId?: number | string | null; actorEmail?: string | null }
): Promise<{ key: string; url: string }> {
  const normalizedBuffer = Buffer.isBuffer(data)
    ? data
    : typeof data === "string"
    ? Buffer.from(data)
    : Buffer.from(data);

  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    logger.warn("Rejected upload: unsupported mime type", {
      context: "Storage",
      contentType,
      key: relKey,
    });
    throw new Error(`Unsupported file type: ${contentType}`);
  }

  if (normalizedBuffer.byteLength > MAX_UPLOAD_BYTES) {
    logger.warn("Rejected upload: file too large", {
      context: "Storage",
      key: relKey,
      size: normalizedBuffer.byteLength,
    });
    throw new Error(
      `File too large: ${normalizedBuffer.byteLength} bytes (max ${MAX_UPLOAD_BYTES})`
    );
  }

  if (CLOUDINARY_ENABLED) {
    ensureCloudinaryConfigured();
    const key = normalizeKey(relKey);
    const publicId = toCloudinaryPublicId(relKey);
    const resourceType = resolveResourceType(contentType);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          overwrite: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error || !result) {
            logger.error("Cloudinary upload failed", {
              context: "Storage",
              provider: "cloudinary",
              key: relKey,
              contentType,
              error: error?.message ?? error,
            });
            reject(
              new Error(
                `Cloudinary upload failed${
                  error?.message ? `: ${error.message}` : ""
                }`
              )
            );
            return;
          }

          logger.info("File uploaded", {
            context: "Storage",
            provider: "cloudinary",
            key,
            size: normalizedBuffer.byteLength,
            contentType,
            actorId: meta?.actorId ?? null,
            actorEmail: meta?.actorEmail ?? null,
          });

          resolve({
            key,
            url: result.secure_url || result.url,
          });
        }
      );

      stream.end(normalizedBuffer);
    });
  }

  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(
    normalizedBuffer,
    contentType,
    key.split("/").pop() ?? key
  );
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  logger.info("File uploaded", {
    context: "Storage",
    provider: "forge",
    key,
    size: normalizedBuffer.byteLength,
    contentType,
    actorId: meta?.actorId ?? null,
    actorEmail: meta?.actorEmail ?? null,
  });
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  if (CLOUDINARY_ENABLED) {
    ensureCloudinaryConfigured();
    const key = normalizeKey(relKey);
    const url = cloudinary.url(toCloudinaryPublicId(relKey), {
      secure: true,
      resource_type: resourceTypeFromKey(relKey),
    });
    return { key, url };
  }

  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
