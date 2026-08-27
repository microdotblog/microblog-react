const EXTENSIONS_BY_MIME_TYPE = {
  "application/pdf": ".pdf",
  "audio/aac": ".aac",
  "audio/flac": ".flac",
  "audio/m4a": ".m4a",
  "audio/mp3": ".mp3",
  "audio/mp4": ".m4a",
  "audio/mpeg": ".mp3",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
  "audio/x-m4a": ".m4a",
  "audio/x-wav": ".wav",
  "audio/x-ms-wma": ".wma",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heic",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/jxl": ".jxl",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
  "video/avi": ".avi",
  "video/mp4": ".mp4",
  "video/mpeg": ".mp4",
  "video/mov": ".mov",
  "video/ogg": ".ogv",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "video/x-flv": ".flv",
  "video/x-m4v": ".m4v",
  "video/x-ms-wmv": ".wmv"
}

// Leave room for the timestamp prefix and filesystem-specific filename limits.
const MAX_CACHE_FILE_NAME_LENGTH = 120

export const inferExtensionFromType = (mime = "") => {
  const normalized_mime = mime.toLowerCase().split(";")[0].trim()
  return EXTENSIONS_BY_MIME_TYPE[normalized_mime] || ""
}

const decodedValue = value => {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

const lastPathComponent = value => {
  if (typeof value !== "string") {
    return ""
  }
  const without_query = value.split(/[?#]/)[0]
  const decoded_value = decodedValue(without_query)
  return decoded_value.split(/[\\/]/).pop() || ""
}

const getExtension = name => {
  const dot_index = name.lastIndexOf(".")
  if (dot_index < 0 || dot_index === name.length - 1) {
    return ""
  }
  const extension = name.slice(dot_index).toLowerCase()
  return /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : ""
}

const fileNameStem = (name, extension = "") => {
  const name_without_extension = extension ? name.slice(0, -extension.length) : name
  return name_without_extension.replace(/^[.-]+|[.-]+$/g, "")
}

export const originalFileNameFromMedia = media => {
  const explicit_name = media?.original_filename || media?.fileName || media?.filename || media?.name
  return lastPathComponent(explicit_name || media?.uri || media?.cached_uri || media?.cachedUri)
}

export const sanitizeFileName = name => {
  const last_component = lastPathComponent(name).trim()
  if (!last_component) {
    return ""
  }
  const normalized_component = typeof last_component.normalize === "function"
    ? last_component.normalize("NFKD")
    : last_component
  return normalized_component
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/[^0-9a-z.-]/g, "")
}

export const buildUploadFileName = (media, fallback_id, fallback_type = "") => {
  const fallback_name = `upload-${fallback_id ?? Date.now()}`
  const candidate_name = originalFileNameFromMedia(media)
  const safe_candidate = sanitizeFileName(candidate_name)
  const candidate_extension = getExtension(safe_candidate)
  const expected_extension = inferExtensionFromType(media?.type || fallback_type)
  const stem = fileNameStem(safe_candidate, candidate_extension) || fallback_name

  if (expected_extension) {
    return `${stem}${expected_extension}`
  }
  return `${stem}${candidate_extension}`
}

export const buildCacheFileName = (name, max_length = MAX_CACHE_FILE_NAME_LENGTH) => {
  const safe_name = sanitizeFileName(name)
  const extension = getExtension(safe_name)
  const fallback_stem = "upload"
  const available_length = Math.max(1, max_length - extension.length)
  const full_stem = fileNameStem(safe_name, extension) || fallback_stem
  const truncated_stem = full_stem.slice(0, available_length).replace(/[.-]+$/g, "") || fallback_stem
  return `${truncated_stem}${extension}`
}
