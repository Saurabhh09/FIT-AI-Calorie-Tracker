import { describe, expect, it } from "vitest";
import { buildAuthPayload } from "./auth-payload";

describe("buildAuthPayload", () => {
  it("sends only fields accepted by the strict login schema", () => {
    const form = new FormData();
    form.set("email", "  person@example.com ");
    form.set("password", "a-long-test-password");
    expect(buildAuthPayload("login", form)).toEqual({
      email: "person@example.com",
      password: "a-long-test-password"
    });
  });

  it("includes the display name only for signup", () => {
    const form = new FormData();
    form.set("name", "  Asha  ");
    form.set("email", "asha@example.com");
    form.set("password", "a-long-test-password");
    expect(buildAuthPayload("signup", form)).toEqual({
      email: "asha@example.com",
      password: "a-long-test-password",
      name: "Asha"
    });
  });
});
