import { describe, expect, it } from "vitest";
import { detectWebGL2 } from "../src/web/scene/capability";

function fakeDoc(getContext: (type: string) => unknown) {
  return {
    createElement: () => ({
      getContext,
    }),
  } as unknown as Pick<Document, "createElement">;
}

describe("detectWebGL2", () => {
  it("returns false when a context is unavailable", () => {
    expect(detectWebGL2(fakeDoc(() => null))).toBe(false);
  });

  it("returns false when only webgl1 exists", () => {
    expect(detectWebGL2(fakeDoc((type) => (type === "webgl" ? {} : null)))).toBe(false);
  });

  it("returns true when webgl2 is available", () => {
    expect(detectWebGL2(fakeDoc((type) => (type === "webgl2" ? {} : null)))).toBe(true);
  });

  it("returns false when getContext throws", () => {
    expect(
      detectWebGL2(
        fakeDoc(() => {
          throw new Error("blocked");
        }),
      ),
    ).toBe(false);
  });
});
