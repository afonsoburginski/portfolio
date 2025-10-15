"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type WithClass<T> = T & { className?: string };

export function TypographyH1({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h1 className={cn("scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance", className)} {...props}>
      {children}
    </h1>
  );
}

export function TypographyH2({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)} {...props}>
      {children}
    </h2>
  );
}

export function TypographyH3({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function TypographyH4({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h4>
  );
}

export function TypographyP({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}>
      {children}
    </p>
  );
}

export function TypographyBlockquote({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLQuoteElement>>) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props}>
      {children}
    </blockquote>
  );
}

export function TypographyTable({ className, ...props }: WithClass<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("my-6 w-full overflow-y-auto", className)} {...props}>
      <table className="w-full">
        <thead>
          <tr className="even:bg-muted m-0 border-t p-0">
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
              King&apos;s Treasury
            </th>
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
              People&apos;s happiness
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="even:bg-muted m-0 border-t p-0">
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">Empty</td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">Overflowing</td>
          </tr>
          <tr className="even:bg-muted m-0 border-t p-0">
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">Modest</td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">Satisfied</td>
          </tr>
          <tr className="even:bg-muted m-0 border-t p-0">
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">Full</td>
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">Ecstatic</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function TypographyList({ className, ...props }: WithClass<React.HTMLAttributes<HTMLUListElement>>) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>
      <li>1st level of puns: 5 gold coins</li>
      <li>2nd level of jokes: 10 gold coins</li>
      <li>3rd level of one-liners : 20 gold coins</li>
    </ul>
  );
}

export function TypographyInlineCode({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLElement>>) {
  return (
    <code className={cn("bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props}>
      {children}
    </code>
  );
}

export function TypographyLead({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn("text-muted-foreground text-xl", className)} {...props}>
      {children}
    </p>
  );
}

export function TypographyLarge({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </div>
  );
}

export function TypographySmall({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLElement>>) {
  return (
    <small className={cn("text-sm leading-none font-medium", className)} {...props}>
      {children}
    </small>
  );
}

export function TypographyMuted({ className, children, ...props }: WithClass<React.HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </p>
  );
}

// Intencionalmente vazio: usando utilitários do Tailwind/shadcn diretamente.