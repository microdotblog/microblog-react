export const inferExtensionFromType = (mime = "") => {
  if (mime.includes("quicktime")) {
    return ".mov"
  }
  if (mime.includes("mp4")) {
    return ".mp4"
  }
  if (mime.includes("m4v")) {
    return ".m4v"
  }
  if (mime.includes("webm")) {
    return ".webm"
  }
  if (mime.includes("ogg")) {
    return ".ogv"
  }
  return ".mp4"
}

const getExtension = name => {
  if (!name) {
    return ""
  }
  const parts = name.split(".")
  if (parts.length < 2) {
    return ""
  }
  const extension = parts.pop()
  if (!extension) {
    return ""
  }
  return `.${extension}`
}

export const sanitizeFileName = name => {
  if (!name) {
    return ""
  }
  return name.trim().replace(/[^\w.\-]/g, "_")
}

export const buildUploadFileName = (media, fallback_id) => {
  const candidate_name = media?.fileName || media?.filename || media?.name
  const safe_candidate = sanitizeFileName(candidate_name)
  const base_name = safe_candidate || `upload-${fallback_id || Date.now()}`
  const extension = getExtension(base_name)
  if (!extension) {
    return `${base_name}${inferExtensionFromType(media?.type || "")}`
  }
  return base_name
}
