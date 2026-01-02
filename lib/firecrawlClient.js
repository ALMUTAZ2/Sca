import Firecrawl from "@mendable/firecrawl-js";

if (!process.env.FIRECRAWL_API_KEY) {
  console.warn("⚠️ FIRECRAWL_API_KEY is not set.");
}

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY
});

export default firecrawl;
