"use client";

import { useEffect, useState } from "react";

type ExampleItem = { _id?: string; title?: string; description?: string };

export default function ProductsClient() {
  const [items, setItems] = useState<ExampleItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/example");
        if (!res.ok) {
          // non-2xx — treat as transient and show friendly message
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || res.statusText || "Unknown error");
        }
        const payload = await res.json();
        if (mounted) setItems(payload.data ?? []);
      } catch (err: unknown) {
        console.error("Failed to load example items:", err);
        const message = err instanceof Error ? err.message : String(err);
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading items...</div>;
  if (error) return <div>Could not load items ({error}). Showing fallback UI.</div>;
  if (!items || items.length === 0) return <div>No items found (fallback).</div>;

  return (
    <ul>
      {items.map((it) => (
        <li key={it._id || Math.random()}>
          <strong>{it.title}</strong>
          <div>{it.description}</div>
        </li>
      ))}
    </ul>
  );
}
