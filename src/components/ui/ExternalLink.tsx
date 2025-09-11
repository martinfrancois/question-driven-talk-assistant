import React, { JSX } from "react";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

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
