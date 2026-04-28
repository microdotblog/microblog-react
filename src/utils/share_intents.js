export function share_type_for_mime_type(mime_type) {
  if (typeof mime_type === "string" && mime_type.startsWith("text/")) {
    return "text"
  }

  if (mime_type === "application/json") {
    return "json"
  }

  if (typeof mime_type === "string" && mime_type.startsWith("image/")) {
    return "image"
  }

  return null
}

export function is_supported_share_mime_type(mime_type) {
  return share_type_for_mime_type(mime_type) != null
}
