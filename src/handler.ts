import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

import { proxies } from "./config/proxies";

export async function handleEvent(event: FetchEvent) {
  const url: URL = new URL(event.request.url);

  for (const proxy of proxies) {
    if (url.pathname.startsWith(proxy.prefix)) {
      return await fetch(
        proxy.target + url.pathname.substr(proxy.prefix.length),
        event.request
      );
    }
  }

  try {
    // Pass the original request headers to getAssetFromKV
    return await getAssetFromKV(event, {
      headers: event.request.headers,
    });
  } catch (ex) {
    if (ex.status === 404) {
      // Page not found. Do a 404 fallback for SPA
      return await getAssetFromKV(event, {
        mapRequestToAsset: (req) => {
          return new Request(`${new URL(req.url).origin}/index.html`, {
            headers: req.headers, // Pass the original request headers
          });
        },
      });
    }

    // Re-throw unexpected exception
    throw ex;
  }
}
