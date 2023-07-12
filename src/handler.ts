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
    const originalResponse = await getAssetFromKV(event, {});

    // Retrieve original server response headers
    const originalHeaders = originalResponse.headers;

    // Clone the original response to preserve its body
    const clonedResponse = new Response(originalResponse.body, originalResponse);

    // Retrieve headers from the KV response
    const kvHeaders = clonedResponse.headers;

    // Merge the headers from the original server response and the KV response
    const mergedHeaders = new Headers([...kvHeaders, ...originalHeaders]);

    // Create a new response with the merged headers
    const responseWithMergedHeaders = new Response(clonedResponse.body, {
      ...clonedResponse,
      headers: mergedHeaders,
    });

    return responseWithMergedHeaders;
  } catch (ex) {
    if (ex.status === 404) {
      // Page not found. Do a 404 fallback for SPA
      return await getAssetFromKV(event, {
        mapRequestToAsset: (req) => {
          return new Request(`${new URL(req.url).origin}/index.html`);
        },
      });
    }

    // Re-throw unexpected exception
    throw ex;
  }
}
