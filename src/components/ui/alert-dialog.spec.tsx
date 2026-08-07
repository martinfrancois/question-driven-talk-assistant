import { describe, expect, it } from "vitest";
import { useState } from "react";
import { render } from "vitest-browser-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog.tsx";
import { buttonVariants } from "./button-variants.tsx";
import { cn } from "@/lib/utils.ts";
import { interact } from "@/test-utils/react.ts";

/**
 * Exercises the real `@radix-ui/react-alert-dialog` primitive end to end:
 * trigger, portal, overlay, focus handling and the action/cancel buttons.
 * Radix renders into a portal on `document.body`, so assertions query the
 * document. A breaking change in Radix's alert dialog fails these tests.
 */
describe("AlertDialog", () => {
  const Harness = ({
    onConfirm,
    onCancel,
  }: {
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger data-testid="open">Delete</AlertDialogTrigger>
        <AlertDialogContent data-testid="content">
          <AlertDialogHeader data-testid="header">
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter data-testid="footer">
            <AlertDialogCancel data-testid="cancel" onClick={onCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction data-testid="confirm" onClick={onConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const byTestId = (id: string): HTMLElement | null =>
    document.body.querySelector(`[data-testid='${id}']`);

  const open = async () => {
    await interact(() => byTestId("open")?.click());
  };

  it("keeps the dialog closed until the trigger is used", async () => {
    await render(<Harness />);

    expect(byTestId("content")).toBeNull();
  });

  it("opens with the alertdialog role", async () => {
    await render(<Harness />);

    await open();

    expect(byTestId("content")).not.toBeNull();
    expect(byTestId("content")?.getAttribute("role")).toBe("alertdialog");
  });

  it("wires the title and description to the dialog for screen readers", async () => {
    await render(<Harness />);

    await open();
    const content = byTestId("content");
    const labelledBy = content?.getAttribute("aria-labelledby");
    const describedBy = content?.getAttribute("aria-describedby");

    expect(document.getElementById(labelledBy ?? "")?.textContent).toBe(
      "Are you absolutely sure?",
    );
    expect(document.getElementById(describedBy ?? "")?.textContent).toBe(
      "This action cannot be undone.",
    );
  });

  it("renders an overlay behind the dialog", async () => {
    await render(<Harness />);

    await open();

    const overlay = document.body.querySelector("[data-state='open'].fixed");
    expect(overlay).not.toBeNull();
  });

  it("moves focus into the dialog when it opens", async () => {
    await render(<Harness />);

    await open();

    expect(byTestId("content")?.contains(document.activeElement)).toBe(true);
  });

  it("runs the action handler and closes", async () => {
    let confirmed = 0;
    await render(
      <Harness
        onConfirm={() => {
          confirmed++;
        }}
      />,
    );

    await open();
    await interact(() => byTestId("confirm")?.click());

    expect(confirmed).toBe(1);
    expect(byTestId("content")).toBeNull();
  });

  it("runs the cancel handler and closes", async () => {
    let cancelled = 0;
    await render(
      <Harness
        onCancel={() => {
          cancelled++;
        }}
      />,
    );

    await open();
    await interact(() => byTestId("cancel")?.click());

    expect(cancelled).toBe(1);
    expect(byTestId("content")).toBeNull();
  });

  it("styles the action button with the default button variant", async () => {
    await render(<Harness />);

    await open();

    expect(byTestId("confirm")?.className).toBe(cn(buttonVariants()));
  });

  it("styles the cancel button with the outline variant", async () => {
    await render(<Harness />);

    await open();

    const className = byTestId("cancel")?.className ?? "";
    expect(className).toContain("mt-2");
    expect(className).toContain("border");
  });

  it("lays out the header and footer with their own classes", async () => {
    await render(<Harness />);

    await open();

    expect(byTestId("header")?.className).toContain("flex-col");
    expect(byTestId("footer")?.className).toContain("flex-col-reverse");
  });

  it("can be reopened after being dismissed", async () => {
    await render(<Harness />);

    await open();
    await interact(() => byTestId("cancel")?.click());
    await open();

    expect(byTestId("content")).not.toBeNull();
  });

  it("exports a portal and overlay that compose into a custom dialog", async () => {
    await render(
      <AlertDialog open>
        <AlertDialogPortal>
          <AlertDialogOverlay
            data-testid="custom-overlay"
            className="bg-red-500/50"
          />
        </AlertDialogPortal>
      </AlertDialog>,
    );

    const overlay = byTestId("custom-overlay");
    expect(overlay).not.toBeNull();
    expect(overlay?.className).toContain("bg-red-500/50");
    expect(overlay?.className).toContain("fixed");
    expect(overlay?.getAttribute("data-state")).toBe("open");
  });
});
