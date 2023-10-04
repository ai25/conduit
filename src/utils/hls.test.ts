import { describe, expect, it } from "vitest";
import { fetchBlob, fetchText, fetchAssetData } from "./hls";

describe("fetchBlob", () => {
  it("should return a blob", async () => {
    const blob = await fetchBlob("https://www.w3.org/TR/PNG/iso_8859-1.txt");
    expect(blob).toBeInstanceOf(Blob);
  });
});
