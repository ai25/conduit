export async function GET(e: any) {
  const url = new URL(e.request.url);
  const swUrl = new URL("/_build/claims-sw.mjs", url.origin).href;
  console.log("fetching", swUrl);

  try {
    const response = await fetch(swUrl);
    console.log(response, "response");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();

    const newHeaders = new Headers();
    newHeaders.set("Content-Type", "application/javascript");
    newHeaders.set("Service-Worker-Allowed", "/");

    return new Response(content, {
      status: 200,
      headers: newHeaders,
    });
  } catch (error) {
    console.error("Error fetching service worker:", error);
    return new Response("Error fetching service worker", { status: 500 });
  }
}
