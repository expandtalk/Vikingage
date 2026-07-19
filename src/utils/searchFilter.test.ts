import { describe, it, expect } from "vitest";
import { sanitizeFilterValue } from "./searchFilter";

describe("sanitizeFilterValue (PostgREST filter-injection guard)", () => {
  it("passes plain terms through unchanged", () => {
    expect(sanitizeFilterValue("Uppland")).toBe("Uppland");
    expect(sanitizeFilterValue("U 370")).toBe("U 370");
  });

  it("strips PostgREST filter metacharacters", () => {
    // commas separate .or() conditions, parens group them — must not survive
    expect(sanitizeFilterValue("a,b")).toBe("a b");
    expect(sanitizeFilterValue("x)or(y")).toBe("x or y");
    expect(sanitizeFilterValue('quote"here')).toBe("quote here");
    expect(sanitizeFilterValue("wild*card")).toBe("wild card");
    expect(sanitizeFilterValue("per%cent")).toBe("per cent");
    expect(sanitizeFilterValue("back\\slash")).toBe("back slash");
  });

  it("neutralizes an injection-style payload", () => {
    const payload = 'x,signum.ilike.*,id.gt.0)';
    const out = sanitizeFilterValue(payload);
    expect(out).not.toMatch(/[,()*%\\"]/);
  });

  it("collapses whitespace and trims", () => {
    expect(sanitizeFilterValue("  a   b  ")).toBe("a b");
    expect(sanitizeFilterValue("(  )")).toBe("");
  });
});
