import { describe, expect, it } from "vitest";
import { routeHeader } from "@/app/shell/route-header";

describe("routeHeader", () => {
  it("reads the header the deepest route declares", () => {
    const matches = [
      { handle: undefined },
      { handle: { title: "Applications" } },
      { handle: { title: "New application", backChevron: true } },
    ];

    expect(routeHeader(matches)).toEqual({ title: "New application", backChevron: true });
  });

  it("gives a route that declares nothing its parent's header, without the back chevron", () => {
    const drawer = [
      { handle: undefined },
      { handle: { title: "Applications" } },
      { handle: undefined },
    ];

    expect(routeHeader(drawer)).toEqual({ title: "Applications", backChevron: false });
  });

  it("refuses a declaration that is not a header", () => {
    expect(() => routeHeader([{ handle: { title: "" } }])).toThrow();
    expect(() => routeHeader([{ handle: { title: "Resources", backChevron: "yes" } }])).toThrow();
  });

  it("refuses matched routes that declare no header at all", () => {
    expect(() => routeHeader([{ handle: undefined }])).toThrow();
  });
});
