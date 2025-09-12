import type { ReactNode, JSX } from "react";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

/**
 * A reusable component for rendering external hyperlinks.
 *
 * Opens the given URL in a new browser tab with appropriate
 * security settings (`noopener noreferrer`).
 *
 * @param href - The external URL to navigate to.
 * @param children - The content to be displayed inside the link.
 * @returns A styled anchor element that opens in a new tab.
 */
export const ExternalLink = ({
  href,
  children,
}: ExternalLinkProps): JSX.Element => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-blue-500 hover:underline"
    >
      {children}
    </a>
  );
};
