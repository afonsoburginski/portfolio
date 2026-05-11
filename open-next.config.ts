import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = {
  ...defineCloudflareConfig(),
  buildCommand: "npm run next:build",
};

export default config;
