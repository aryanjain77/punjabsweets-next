import React from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="space-y-2">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-sm text-zinc-600">{description}</p>
      )}
    </div>
  );
}

