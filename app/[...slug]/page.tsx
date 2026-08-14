import { Site } from "../site-client";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <Site route={`/${slug.join("/")}`} />;
}
