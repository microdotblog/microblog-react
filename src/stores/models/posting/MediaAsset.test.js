import MediaAsset from "./MediaAsset"

jest.mock("../../../api/MicroPubApi", () => ({
  __esModule: true,
  default: {},
  POST_ERROR: 3
}))

jest.mock("../../../api/XMLRPCApi", () => ({
  __esModule: true,
  default: {},
  XML_ERROR: 2
}))

jest.mock("react-native-fs", () => ({}))

describe("MediaAsset filenames", () => {
  test("preserves the image picker fileName in the model", () => {
    const asset = MediaAsset.create({
      uri: "file:///tmp/picker-video.mov",
      type: "video/quicktime",
      fileName: "Family Clip.MOV"
    })

    expect(asset.original_file_name).toBe("Family Clip.MOV")
  })

  test("falls back to the URI basename", () => {
    const asset = MediaAsset.create({
      uri: "file:///tmp/Shared%20Photo.JPG",
      type: "image/jpeg"
    })

    expect(asset.original_file_name).toBe("Shared Photo.JPG")
  })
})
