import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

import { proxies } from "./config/proxies";

export async function handleEvent(event: FetchEvent) {
  const url: URL = new URL(event.request.url);

  for (const proxy of proxies) {
    if (url.pathname.startsWith(proxy.prefix)) {
      // Proxy request to the target URL and include original request headers
      const response = await fetch(
        proxy.target + url.pathname.substr(proxy.prefix.length),
        {
          ...event.request,
          headers: new Headers(event.request.headers)
        }
      );
      return response;
    }
  }

  try {
    // Fetch asset from Key-Value store and include original request headers
    return await getAssetFromKV(event, {
      headers: {
        ...event.request.headers
      }
    });
  } catch (ex) {
    if (ex.status === 404) {
      // Page not found. Do a 404 fallback for SPA and include original request headers
      return await getAssetFromKV(event, {
        mapRequestToAsset: (req) => {
          return new Request(`${new URL(req.url).origin}/index.html`, {
            headers: new Headers(req.headers)
          });
        }
      });
    }

    // Re-throw unexpected exception
    throw ex;
  }
}
