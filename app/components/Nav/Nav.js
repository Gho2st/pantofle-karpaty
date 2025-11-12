import ClientNav from "./ClientNav";

async function getCategories() {
  console.log("Pobieram kategorie...");
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/categories?parentId=null`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.categories || [];
}

export default async function ServerNav() {
  const categories = await getCategories();
  return <ClientNav initialCategories={categories} />;
}
