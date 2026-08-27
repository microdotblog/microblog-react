import {
  buildCacheFileName,
  buildUploadFileName,
  inferExtensionFromType,
  originalFileNameFromMedia,
  sanitizeFileName
} from "./file_names"

describe("upload filenames", () => {
  test("normalizes picker filename shapes", () => {
    expect(buildUploadFileName({
      original_file_name: "Final Clip.MOV",
      fileName: "Ignored Clip.mp4",
      type: "video/quicktime"
    }, 1)).toBe("final-clip.mov")
    expect(buildUploadFileName({
      name: "My Recording.MP3",
      type: "audio/mpeg"
    }, 2)).toBe("my-recording.mp3")
  })

  test("falls back to a decoded URI basename", () => {
    const media = {
      uri: "file:///tmp/My%20Photo.jpeg?edited=true",
      type: "image/jpeg"
    }
    expect(originalFileNameFromMedia(media)).toBe("My Photo.jpeg")
    expect(buildUploadFileName(media, 3)).toBe("my-photo.jpg")
  })

  test("uses the MIME type when the filename is missing", () => {
    expect(buildUploadFileName({ type: "audio/mpeg" }, 42)).toBe("upload-42.mp3")
    expect(buildUploadFileName({ type: "image/jpeg" }, 42)).toBe("upload-42.jpg")
    expect(buildUploadFileName({ type: "video/quicktime" }, 42)).toBe("upload-42.mov")
    expect(buildUploadFileName({ type: "video/mpeg" }, 42)).toBe("upload-42.mp4")
    expect(buildUploadFileName({}, 42)).toBe("upload-42")
  })

  test("distinguishes audio and video Ogg files", () => {
    expect(inferExtensionFromType("audio/ogg")).toBe(".ogg")
    expect(inferExtensionFromType("video/ogg; codecs=theora")).toBe(".ogv")
  })

  test("replaces missing or mismatched extensions", () => {
    expect(buildUploadFileName({ fileName: "clip.", type: "video/mp4" }, 4)).toBe("clip.mp4")
    expect(buildUploadFileName({ fileName: "draft.final", type: "video/mp4" }, 4)).toBe("draft.mp4")
    expect(buildUploadFileName({ fileName: "photo.heic", type: "image/jpeg" }, 4)).toBe("photo.jpg")
  })

  test("uses a fallback stem when normalization removes the original name", () => {
    expect(buildUploadFileName({ fileName: "旅行.mov", type: "video/quicktime" }, 9)).toBe("upload-9.mov")
    expect(sanitizeFileName("Résumé 2026.MOV")).toBe("resume-2026.mov")
  })

  test("removes path components from explicit names", () => {
    expect(originalFileNameFromMedia({ fileName: "C:\\private\\Clip One.MOV" })).toBe("Clip One.MOV")
    expect(buildUploadFileName({
      fileName: "../private/Clip One.MOV",
      type: "video/quicktime"
    }, 5)).toBe("clip-one.mov")
  })

  test("keeps unknown but plausible extensions", () => {
    expect(buildUploadFileName({ fileName: "archive.custom" }, 6)).toBe("archive.custom")
    expect(buildUploadFileName({ fileName: "archive" }, 6)).toBe("archive")
  })

  test("limits cache filenames while preserving the extension", () => {
    const filename = buildCacheFileName(`${"a".repeat(200)}.mp4`)
    expect(filename).toHaveLength(120)
    expect(filename.endsWith(".mp4")).toBe(true)
    expect(buildCacheFileName("../../Private Clip.MOV")).toBe("private-clip.mov")
  })
})
