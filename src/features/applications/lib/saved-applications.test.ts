import { describe, expect, it } from "vitest";
import { exampleApplication } from "@/domain/dataset";
import { startingApplications } from "@/features/applications/lib/saved-applications";

const payments = {
  id: "5b0c6a8e-0d6f-4a57-9f7e-2f0f4b8f6c11",
  name: "Payments API",
  description: "Card processing",
  resourceIds: ["r-001", "r-004", "r-005"],
};

describe("saved-data resolution", () => {
  it("starts from the example Application alone on a first run", () => {
    expect(startingApplications(undefined)).toEqual([exampleApplication]);
  });

  it.each([
    ["a string", "garbage"],
    ["a number", 42],
    ["null", null],
    ["an object without a list", { other: [] }],
    ["a list that is not a list", { applications: "Payments API" }],
    ["an Application of the wrong shape", { applications: [{ id: 1, name: "Payments API" }] }],
    ["one bad Application among good ones", { applications: [payments, { name: "Checkout" }] }],
  ])("keeps the first-run state when the saved value is %s", (_, saved) => {
    expect(startingApplications(saved)).toEqual([exampleApplication]);
  });

  it("starts with no Applications when an empty list is saved", () => {
    expect(startingApplications({ applications: [] })).toEqual([]);
  });

  it("keeps a deleted example deleted", () => {
    expect(startingApplications({ applications: [payments] })).toEqual([payments]);
  });

  it("keeps the saved order, newest first", () => {
    expect(startingApplications({ applications: [payments, exampleApplication] })).toEqual([
      payments,
      exampleApplication,
    ]);
  });

  it("drops a Member whose Resource is missing and keeps the Application", () => {
    const saved = { applications: [{ ...payments, resourceIds: ["r-001", "r-999", "r-005"] }] };

    expect(startingApplications(saved)).toEqual([{ ...payments, resourceIds: ["r-001", "r-005"] }]);
  });

  it("keeps an Application whose Members are all missing, with none left", () => {
    const saved = { applications: [{ ...payments, resourceIds: ["r-998", "r-999"] }] };

    expect(startingApplications(saved)).toEqual([{ ...payments, resourceIds: [] }]);
  });
});
