import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Alert, AlertDescription, AlertTitle } from "./alert.tsx";

/**
 * Exercises the real `class-variance-authority` variant lookup and the real
 * `clsx` + `tailwind-merge` class composition behind `cn`. A regression in any
 * of those libraries changes the emitted class list and fails these tests.
 */
describe("Alert", () => {
  it("renders as an alert landmark", async () => {
    const { container } = await render(<Alert>Something happened</Alert>);

    const alert = container.querySelector("[role='alert']");
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toBe("Something happened");
  });

  it("applies the default variant when none is given", async () => {
    const { container } = await render(<Alert />);

    const className =
      container.querySelector("[role='alert']")?.className ?? "";
    expect(className).toContain("bg-white");
    expect(className).toContain("text-neutral-950");
    expect(className).not.toContain("border-red-500/50");
  });

  it("applies the destructive variant when asked", async () => {
    const { container } = await render(<Alert variant="destructive" />);

    const className =
      container.querySelector("[role='alert']")?.className ?? "";
    expect(className).toContain("border-red-500/50");
    expect(className).toContain("text-red-500");
    expect(className).not.toContain("bg-white");
  });

  it("keeps the shared base classes for every variant", async () => {
    const { container } = await render(<Alert variant="destructive" />);

    const className =
      container.querySelector("[role='alert']")?.className ?? "";
    expect(className).toContain("relative");
    expect(className).toContain("w-full");
    expect(className).toContain("rounded-lg");
  });

  it("merges a caller supplied class instead of duplicating a conflicting one", async () => {
    const { container } = await render(<Alert className="p-8" />);

    const className =
      container.querySelector("[role='alert']")?.className ?? "";
    // tailwind-merge must drop the base `p-4` in favour of the override.
    expect(className).toContain("p-8");
    expect(className.split(/\s+/)).not.toContain("p-4");
  });

  it("forwards arbitrary props to the underlying element", async () => {
    const { container } = await render(<Alert data-testid="my-alert" id="x" />);

    const alert = container.querySelector("[role='alert']");
    expect(alert?.getAttribute("data-testid")).toBe("my-alert");
    expect(alert?.id).toBe("x");
  });

  it("renders the title as a heading", async () => {
    const { container } = await render(
      <Alert>
        <AlertTitle>Update ready</AlertTitle>
      </Alert>,
    );

    const title = container.querySelector("h5");
    expect(title?.textContent).toBe("Update ready");
    expect(title?.className).toContain("font-medium");
  });

  it("renders the description", async () => {
    const { container } = await render(
      <Alert>
        <AlertDescription>Reload to apply it.</AlertDescription>
      </Alert>,
    );

    expect(container.querySelector("[role='alert'] > div")?.textContent).toBe(
      "Reload to apply it.",
    );
  });

  it("exposes display names used by React devtools", () => {
    expect(Alert.displayName).toBe("Alert");
    expect(AlertTitle.displayName).toBe("AlertTitle");
    expect(AlertDescription.displayName).toBe("AlertDescription");
  });
});
