import { getAssetFromKV, putAssetInKV } from "@cloudflare/kv-asset-handler";
import { proxies } from "./config/proxies";

export async function handleEvent(event: FetchEvent) {
  const url = new URL(event.request.url);

  for (const proxy of proxies) {
    if (url.pathname.startsWith(proxy.prefix)) {
      return await fetch(
        proxy.target + url.pathname.substr(proxy.prefix.length),
        event.request
      );
    }
  }

  // Check if the asset is already in the key-value store
  let response = await getAssetFromKV(event, {});

  if (!response) {
    // Fetch the file from your server
    const serverResponse = await fetch(url.pathname);

    // Cache the headers from your server's response
    const headers = Object.fromEntries(serverResponse.headers.entries());

    // Store the file in the key-value store with its associated headers
    await putAssetInKV(event, {
      headers: JSON.stringify(headers),
    });

    // Create a new response object with the server's response body and the original headers from the server's response
    response = new Response(serverResponse.body, {
      status: serverResponse.status,
      headers: serverResponse.headers,
    });
  }

  return response;
}
