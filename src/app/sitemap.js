import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export default function sitemap() {
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/home`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
    { url: `${baseUrl}/comic`, lastModified: new Date() },
    { url: `${baseUrl}/comic/search`, lastModified: new Date() },
    { url: `${baseUrl}/donate`, lastModified: new Date() },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    { url: `${baseUrl}/register`, lastModified: new Date() },
    { url: `${baseUrl}/user`, lastModified: new Date() },
    { url: `${baseUrl}/user/setting`, lastModified: new Date() },
  ];
}
