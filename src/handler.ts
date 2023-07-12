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

    // Add custom headers to the merged headers
    mergedHeaders.set("Access-Control-Allow-Origin", "https://simeononsecurity.ch, https://simeononsecurity.com, https://*.simeononsecurity.ch, https://*.simeononsecurity.com, https://*.cloudfront.net, https://ajax.cloudflare.com, https://raw.githubusercontent.com, https://*.googlesyndication.com, https://*.amazon-adsystem.com, https://cdnjs.cloudflare.com, https://ws-na.amazon-adsystem.com, https://www.google-analytics.com, https://cdn.ampproject.org, https://cdn.jsdelivr.net, https://*.gstatic.com, https://googleads.g.doubleclick.net, https://tpc.googlesyndication.com, https://googletagservices.com, https://utteranc.es, https://*.utteranc.es, https://go.ezoic.net, https://static.cloudflareinsights.com, https://www.youtube.com");
    mergedHeaders.set("Cache-Control", "Public, max-age=31536000");
    mergedHeaders.set("Permissions-Policy", "sync-xhr=(self), accelerometer=(), camera=(), display-capture=(), geolocation=(), microphone=(), midi=(), payment=(), usb=(), gyroscope=(), magnetometer=(), screen-wake-lock=(), xr-spatial-tracking=()");
    mergedHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    mergedHeaders.set("Upgrade-Insecure-Requests", "1");
    mergedHeaders.set("Referrer-Policy", "strict-origin");
    mergedHeaders.set("X-DNS-Prefetch-Control", "active");
    mergedHeaders.set("X-Content-Type-Options", "nosniff");
    mergedHeaders.set("X-Frame-Options", "sameorigin");
    mergedHeaders.set("X-Robots-Tag", "index, follow");
    mergedHeaders.set("X-Xss-Protection", "1; mode=block");
    mergedHeaders.set("Content-Security-Policy", "default-src 'self' https://simeononsecurity.ch https://simeononsecurity.com https://*.simeononsecurity.ch https://*.simeononsecurity.com https://*.cloudfront.net https://ajax.cloudflare.com https://raw.githubusercontent.com 'unsafe-inline' https: data:; script-src 'self' https://simeononsecurity.ch https://simeononsecurity.com https://*.simeononsecurity.ch https://*.simeononsecurity.com https://*.googlesyndication.com https://*.amazon-adsystem.com https://cdnjs.cloudflare.com/ https://*.cloudfront.net https://ajax.cloudflare.com https://raw.githubusercontent.com https://ws-na.amazon-adsystem.com https://www.google-analytics.com/ https://cdn.ampproject.org https://cdn.jsdelivr.net https://*.gstatic.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://googletagservices.com https://utteranc.es https://*.utteranc.es https://pagead2.googlesyndication.com https://go.ezoic.net https://static.cloudflareinsights.com 'unsafe-inline' 'unsafe-eval' https: data:; font-src 'self' data: https: https://fonts.gstatic.com https://*.cloudfront.net https://simeononsecurity.ch https://simeononsecurity.com https://*.simeononsecurity.ch https://*.simeononsecurity.com ; object-src 'none'; img-src 'self' data: https: https://*.cloudfront.net https://raw.githubusercontent.com; frame-src 'self' https: data: https://googleads.g.doubleclick.net https://ws-na.amazon-adsystem.com https://www.youtube.com; upgrade-insecure-requests; frame-ancestors 'none'");
    mergedHeaders.set("Cross-Origin-Opener-Policy-Report-Only", "'unsafe-none; report-to=\"default\"'");
    mergedHeaders.set("Cross-Origin-Opener-Policy", "'unsafe-none; report-to=\"default\"'");
    mergedHeaders.set("Cross-Origin-Embedder-Policy-Report-Only", "'unsafe-none; report-to=\"default\"'");
    mergedHeaders.set("Cross-Origin-Embedder-Policy", "'unsafe-none; report-to=\"default\"'");
    mergedHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
    mergedHeaders.set("Server", "simeononsecurity");
    mergedHeaders.set("pagespeed", "on");
    mergedHeaders.append("Link", `<https://amazon-adsystem.com>; rel=preconnect, <https://cdnjs.cloudflare.com>; rel=preconnect, <https://cdn.ampproject.org>; rel=preconnect, <https://cdn.jsdelivr.net>; rel=preconnect, <https://cloudfront.ne>; rel=preconnect, <https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect, <https://google-analytics.com>; rel=preconnect, <https://googleads.g.doubleclick.net>; rel=preconnect, <https://googletagservices.com>; rel=preconnect, <https://gstatic.com>; rel=preconnect, <https://maxcdn.bootstrapcdn.com>; rel=preconnect, <https://pagead1.googlesyndication.com>; rel=preconnect, <https://pagead2.googlesyndication.com>; rel=preconnect, <https://securepubads.g.doubleclick.net>; rel=preconnect, <https://static.cloudflareinsights.com>; rel=preconnect, <https://tpc.googlesyndication.com>; rel=preconnect, <https://utteranc.es>; rel=preconnect, <https://www.clarity.ms>; rel=preconnect, <https://www.google-analytics.com>; rel=preconnect, <https://www.gstatic.com>; rel=preconnect, <https://www.googletagmanager.com>; rel=preconnect, <https://z-na.amazon-adsystem.com>; rel=preconnect, <https://`);

    // Set additional headers based on path
    const path = url.pathname.toLowerCase();
    if (path.endsWith(".html")) {
      mergedHeaders.set("Cache-Control", "public, max-age=3600, must-revalidate");
    } else if (path.endsWith(".htm")) {
      mergedHeaders.set("Cache-Control", "public, max-age=3600, must-revalidate");
    } else if (path.startsWith("/img/")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Expires", `${(new Date()).addYears(1).toUTCString()}`);
    } else if (path.endsWith(".jpeg")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Expires", `${(new Date()).addYears(1).toUTCString()}`);
      mergedHeaders.set("Content-Type", "image/jpeg");
    } else if (path.endsWith(".jpg")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Expires", `${(new Date()).addYears(1).toUTCString()}`);
      mergedHeaders.set("Content-Type", "image/jpeg");
    } else if (path.endsWith(".png")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Expires", `${(new Date()).addYears(1).toUTCString()}`);
      mergedHeaders.set("Content-Type", "image/png");
    } else if (path.endsWith(".webp")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Expires", `${(new Date()).addYears(1).toUTCString()}`);
      mergedHeaders.set("Content-Type", "image/webp");
    } else if (path.endsWith(".ico")) {
      mergedHeaders.set("Cache-Control", "public, max-age=31536000");
      mergedHeaders.set("Expires", `${(new Date()).addYears(1).toUTCString()}`);
      mergedHeaders.set("Content-Type", "image/x-icon");
    } else if (path.endsWith(".css")) {
      mergedHeaders.set("Cache-Control", "public, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Access-Control-Allow-Origin", "*");
      mergedHeaders.set("Content-Type", "text/css");
    } else if (path.endsWith(".js")) {
      mergedHeaders.set("Cache-Control", "public, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Access-Control-Allow-Origin", "*");
      mergedHeaders.set("Content-Type", "application/javascript");
    } else if (path.endsWith(".json")) {
      mergedHeaders.set("Cache-Control", "public, max-age=3600, must-revalidate");
      mergedHeaders.set("Access-Control-Allow-Origin", "*");
      mergedHeaders.set("Content-Type", "application/json");
    } else if (path.endsWith(".xml")) {
      mergedHeaders.set("Cache-Control", "public, max-age=3600, must-revalidate");
      mergedHeaders.set("Access-Control-Allow-Origin", "*");
      mergedHeaders.set("Content-Type", "application/xml");
    } else if (path.endsWith(".mjs")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "text/javascript");
    } else if (path.endsWith(".sass")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "text/x-sass");
    } else if (path.endsWith(".scss")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "text/x-scss");
    } else if (path.endsWith(".less")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "text/x-less");
    } else if (path.endsWith(".wasm")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "application/wasm");
    } else if (path.endsWith(".pdf")) {
      mergedHeaders.set("Cache-Control", "public, must-revalidate, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "application/pdf");
    } else if (path.endsWith(".doc")) {
      mergedHeaders.set("Cache-Control", "public, must-revalidate, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "application/msword");
    } else if (path.endsWith(".xls")) {
      mergedHeaders.set("Cache-Control", "public, must-revalidate, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Content-Type", "application/vnd.ms-excel");
    } else if (path.endsWith(".frag")) {
      mergedHeaders.set("Cache-Control", "public, max-age=3600, must-revalidate");
      mergedHeaders.set("Content-Type", "text/plain");
    } else if (path.startsWith("/fonts/")) {
      mergedHeaders.set("Cache-Control", "public, immutable, s-maxage=604800, max-age=31536000");
      mergedHeaders.set("Access-Control-Allow-Origin", "*");
    } else if (path.startsWith("/audio/")) {
      mergedHeaders.set("Cache-Control", "public, max-age=31536000");
    } else if (path.startsWith("/videos/")) {
      mergedHeaders.set("Cache-Control", "public, max-age=31536000");
    } else if (path.startsWith("/sse/")) {
      mergedHeaders.set("Cache-Control", "no-store");
    } else if (path.startsWith("/api/")) {
      mergedHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    }

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
