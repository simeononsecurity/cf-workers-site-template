import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

import { proxies } from "./config/proxies";

export async function handleEvent(event: FetchEvent) {
  const url: URL = new URL(event.request.url);

  // Parse and apply headers and redirects from _headers and _redirects files
  const headers = await parseHeaders();
  const redirects = await parseRedirects();

  for (const redirect of redirects) {
    const { from, to, status } = redirect;

    if (url.pathname === from) {
      return Response.redirect(to, status);
    }
  }

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
        ...event.request.headers,
        ...headers
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
        },
        headers: {
          ...event.request.headers,
          ...headers
        }
      });
    }

    // Re-throw unexpected exception
    throw ex;
  }
}

async function parseHeaders() {
  try {
    const headersFile = await fetch("/public/_headers");
    const headersText = await headersFile.text();
    const headers = {};

    const lines = headersText.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [path, header, value] = trimmedLine.split(/\s+/);

        if (path && header && value) {
          headers[path] = { [header]: value };
        }
      }
    }

    return headers;
  } catch (error) {
    console.error("Error parsing _headers file:", error);
    return {};
  }
}

async function parseRedirects() {
  try {
    const redirectsFile = await fetch("/public/_redirects");
    const redirectsText = await redirectsFile.text();
    const redirects = [];

    const lines = redirectsText.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [from, to, status] = trimmedLine.split(/\s+/);

        if (from && to) {
          redirects.push({ from, to, status });
        }
      }
    }

    return redirects;
  } catch (error) {
    console.error("Error parsing _redirects file:", error);
    return [];
  }
}

