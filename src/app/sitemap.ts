import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://z-ancestor.namth.online";
  const lineages = ["ha", "tran", "dao", "ngoai"];

  const lineageUrls = lineages.map((id) => ({
    url: `${baseUrl}/tree/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...lineageUrls,
  ];
}
