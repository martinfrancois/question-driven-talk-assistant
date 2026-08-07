import { describe, expect, it } from "vitest";
import { createRef } from "react";
import { render } from "vitest-browser-react";
import { Button } from "./button.tsx";
import { buttonVariants } from "./button-variants.tsx";
import { cn } from "@/lib/utils.ts";
import { interact } from "@/test-utils/react.ts";

/**
 * Exercises the real `class-variance-authority` variants, the real
 * `tailwind-merge` conflict resolution and the real `@radix-ui/react-slot`
 * `asChild` behaviour.
 */
describe("Button", () => {
  const button = (container: HTMLElement) => container.querySelector("button");

  it("renders a button element by default", async () => {
    const { container } = await render(<Button>Click me</Button>);

    expect(button(container)?.tagName).toBe("BUTTON");
    expect(button(container)?.textContent).toBe("Click me");
  });

  it("uses the outline/sm defaults declared by the variants", async () => {
    const { container } = await render(<Button>Default</Button>);

    const className = button(container)?.className ?? "";
    expect(className).toBe(cn(buttonVariants({})));
    expect(className).toContain("border");
    expect(className).toContain("h-9");
    expect(className).toContain("px-3");
  });

  it("runs the variant output through tailwind-merge, collapsing duplicates", async () => {
    // The base classes and the `sm` size both declare `rounded-md`; cva emits
    // both and tailwind-merge is what collapses them to one.
    const raw = buttonVariants({});
    expect(raw.split(/\s+/).filter((c) => c === "rounded-md")).toHaveLength(2);

    const { container } = await render(<Button>Default</Button>);

    const classes = (button(container)?.className ?? "").split(/\s+/);
    expect(classes.filter((c) => c === "rounded-md")).toHaveLength(1);
  });

  it.each([
    ["default", "bg-neutral-900"],
    ["confirmDanger", "bg-red-600"],
    ["confirmSafe", "bg-green-900"],
    ["secondary", "bg-neutral-100"],
    ["ghost", "hover:bg-neutral-100"],
    ["link", "underline-offset-4"],
  ] as const)("applies the %s variant classes", async (variant, expected) => {
    const { container } = await render(<Button variant={variant}>x</Button>);

    expect(button(container)?.className).toContain(expected);
  });

  it.each([
    ["default", "h-10"],
    ["sm", "h-9"],
    ["lg", "h-11"],
    ["icon", "h-10"],
  ] as const)("applies the %s size classes", async (size, expected) => {
    const { container } = await render(<Button size={size}>x</Button>);

    expect(button(container)?.className).toContain(expected);
  });

  it("lets a caller class win over a conflicting variant class", async () => {
    const { container } = await render(
      <Button size="sm" className="h-20">
        x
      </Button>,
    );

    const classes = (button(container)?.className ?? "").split(/\s+/);
    expect(classes).toContain("h-20");
    expect(classes).not.toContain("h-9");
  });

  it("renders its child element instead of a button when asChild is set", async () => {
    const { container } = await render(
      <Button asChild>
        <a href="https://example.com">Link button</a>
      </Button>,
    );

    expect(button(container)).toBeNull();
    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://example.com");
    // The variant classes must still be applied to the slotted child.
    expect(anchor?.className).toContain("inline-flex");
  });

  it("forwards a ref to the rendered element", async () => {
    const ref = createRef<HTMLButtonElement>();

    await render(<Button ref={ref}>x</Button>);

    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("fires its click handler", async () => {
    let clicks = 0;
    const { container } = await render(
      <Button
        onClick={() => {
          clicks++;
        }}
      >
        x
      </Button>,
    );

    await interact(() => button(container)?.click());

    expect(clicks).toBe(1);
  });

  it("does not fire when disabled", async () => {
    let clicks = 0;
    const { container } = await render(
      <Button
        disabled
        onClick={() => {
          clicks++;
        }}
      >
        x
      </Button>,
    );

    await interact(() => button(container)?.click());

    expect(clicks).toBe(0);
    expect(button(container)?.disabled).toBe(true);
  });

  it("exposes a display name used by React devtools", () => {
    expect(Button.displayName).toBe("Button");
  });
});
