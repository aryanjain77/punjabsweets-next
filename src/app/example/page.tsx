import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "Example — DB-safe page",
};

export default function ExamplePage() {
  // Server component: does not touch the DB.
  // All DB access happens via the client-side fetch to /api/example.
  return (
    <main>
      <h1>Example: DB-safe page</h1>
      <p>
        This page renders without waiting for the database. Data is loaded on the
        client and will gracefully fallback if the DB is unreachable.
      </p>
      <ProductsClient />
    </main>
  );
}
