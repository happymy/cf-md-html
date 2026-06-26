const HTML = __INLINED_HTML__;

export default {
  async fetch(request) {
    if (new URL(request.url).pathname !== '/') {
      return new Response('Not Found', { status: 404 });
    }
    return new Response(HTML, {
      headers: {
        'content-type': 'text/html;charset=utf-8',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
        'content-security-policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline' https://cdn.jsdelivr.net/npm/mermaid@11/; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none';",
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'x-frame-options': 'DENY',
      },
    });
  },
};
