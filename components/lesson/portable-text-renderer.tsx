import React from "react";
import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import Link from "next/link";

interface PortableTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  className?: string;
}

const portableTextComponents: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => (
      <p className="text-[15px] sm:text-[15.5px] text-neutral-700 leading-relaxed mb-4">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mt-6 mb-3 tracking-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 mt-6 mb-3 tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-neutral-900 mt-5 mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-neutral-900 mt-4 mb-2">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-500 pl-4 py-1.5 my-4 bg-primary-50/50 rounded-r-lg text-neutral-700 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-5 mb-4 space-y-1.5 text-[15px] text-neutral-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 mb-4 space-y-1.5 text-[15px] text-neutral-700">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200/80 text-[13.5px] font-mono text-neutral-800">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors font-medium"
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className="text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors font-medium"
        >
          {children}
        </Link>
      );
    },
  },
};

export function PortableTextRenderer({ value, className = "" }: PortableTextProps) {
  if (!value) return null;

  return (
    <div className={`prose-neutral max-w-none ${className}`}>
      <PortableText value={value} components={portableTextComponents} />
    </div>
  );
}
