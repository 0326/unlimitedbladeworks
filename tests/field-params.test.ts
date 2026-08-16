import { describe, expect, it } from "vitest";
import { INSTANCE_MAX, INSTANCE_MIN, parseFieldParams } from "../src/web/scene/fieldParams";

describe("parseFieldParams", () => {
  it("returns defaults for an empty search", () => {
    expect(parseFieldParams("")).toEqual({
      tierOverride: null,
      instancesOverride: null,
      debug: false,
      visual: false,
    });
  });

  it("accepts valid tier overrides", () => {
    for (const tier of ["balanced", "low", "static"]) {
      expect(parseFieldParams(`?tier=${tier}`).tierOverride).toBe(tier);
    }
  });

  it("rejects invalid tiers", () => {
    expect(parseFieldParams("?tier=ultra").tierOverride).toBeNull();
  });

  it("clamps instance overrides into the ladder range", () => {
    expect(parseFieldParams("?instances=500").instancesOverride).toBe(500);
    expect(parseFieldParams("?instances=5").instancesOverride).toBe(INSTANCE_MIN);
    expect(parseFieldParams("?instances=9000").instancesOverride).toBe(INSTANCE_MAX);
  });

  it("ignores non-numeric instances", () => {
    expect(parseFieldParams("?instances=abc").instancesOverride).toBeNull();
    expect(parseFieldParams("?instances=").instancesOverride).toBeNull();
  });

  it("parses debug flags", () => {
    expect(parseFieldParams("?debug=1").debug).toBe(true);
    expect(parseFieldParams("?debug=true").debug).toBe(true);
    expect(parseFieldParams("?debug=0").debug).toBe(false);
  });

  it("parses combined parameters", () => {
    const config = parseFieldParams("?tier=low&instances=1000&debug=1&visual=1");
    expect(config).toEqual({
      tierOverride: "low",
      instancesOverride: 1000,
      debug: true,
      visual: true,
    });
  });
});
