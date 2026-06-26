const HTML = __INLINED_HTML__;

export default {
  async fetch() {
    return new Response(HTML, {
      headers: {
        'content-type': 'text/html;charset=utf-8',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
        'content-security-policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none';",
      },
    });
  },
};
