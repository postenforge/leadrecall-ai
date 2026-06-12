import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database insert
vi.mock("./db", () => ({
  insertLead: vi.fn().mockResolvedValue([{ insertId: 1 }]),
}));

// Mock the notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("leads.submit", () => {
  it("accepts valid lead data and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.submit({
      businessName: "Smith Plumbing",
      ownerName: "John Smith",
      phone: "(555) 123-4567",
      email: "john@smithplumbing.com",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects missing business name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.submit({
        businessName: "",
        ownerName: "John Smith",
        phone: "(555) 123-4567",
        email: "john@smithplumbing.com",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.submit({
        businessName: "Smith Plumbing",
        ownerName: "John Smith",
        phone: "(555) 123-4567",
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });

  it("calls insertLead with correct data", async () => {
    const { insertLead } = await import("./db");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.leads.submit({
      businessName: "ABC Roofing",
      ownerName: "Jane Doe",
      phone: "(555) 987-6543",
      email: "jane@abcroofing.com",
    });

    expect(insertLead).toHaveBeenCalledWith({
      businessName: "ABC Roofing",
      ownerName: "Jane Doe",
      phone: "(555) 987-6543",
      email: "jane@abcroofing.com",
    });
  });

  it("calls notifyOwner with lead details", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.leads.submit({
      businessName: "Quick Fix Electric",
      ownerName: "Bob Builder",
      phone: "(555) 111-2222",
      email: "bob@quickfix.com",
    });

    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Quick Fix Electric"),
        content: expect.stringContaining("bob@quickfix.com"),
      })
    );
  });
});
