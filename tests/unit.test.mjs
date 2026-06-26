import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

function escapeAttr(s) {
  return s.replace(/[&"<>]/g, c => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[c]);
}

function isMdFile(file) {
  return /\.md$/i.test(file.name);
}

describe('escapeAttr', () => {
  it('escapes & first to prevent double encoding', () => {
    assert.equal(escapeAttr('&quot;'), '&amp;quot;');
  });
  it('escapes double quotes', () => {
    assert.equal(escapeAttr('"test"'), '&quot;test&quot;');
  });
  it('escapes angle brackets', () => {
    assert.equal(escapeAttr('<script>'), '&lt;script&gt;');
  });
  it('returns safe string unchanged', () => {
    assert.equal(escapeAttr('hello-world'), 'hello-world');
  });
});

describe('isMdFile', () => {
  it('matches .md extension', () => {
    assert.equal(isMdFile({ name: 'readme.md' }), true);
  });
  it('matches .MD case-insensitive', () => {
    assert.equal(isMdFile({ name: 'README.MD' }), true);
  });
  it('rejects non-md files', () => {
    assert.equal(isMdFile({ name: 'readme.txt' }), false);
  });
  it('rejects .mdown extension', () => {
    assert.equal(isMdFile({ name: 'readme.mdown' }), false);
  });
});
