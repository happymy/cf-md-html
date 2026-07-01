import markdownit from 'markdown-it';
import footnote from 'markdown-it-footnote';
import taskLists from 'markdown-it-task-lists';
import strikethrough from 'markdown-it-strikethrough-alt';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import sup from 'markdown-it-sup';
import sub from 'markdown-it-sub';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('go', go);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('markdown', markdown);

function escapeAttr(s) {
  return s.replace(/[&"<>]/g, c => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[c]);
}

const md = markdownit({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang === 'mermaid') {
      return `<pre class="mermaid">${md.utils.escapeHtml(str)}</pre>`;
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${escapeAttr(lang)}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch {}
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
  },
});
md.use(footnote);
md.use(taskLists);
md.use(strikethrough);
md.use(deflist);
md.use(abbr);
md.use(sup);
md.use(sub);

const inputEl = document.getElementById('input');
const previewEl = document.getElementById('preview');
const themeBtn = document.getElementById('theme-btn');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const divider = document.getElementById('divider');
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function render() {
  if (inputEl.value.includes('```mermaid') && !window.mermaid) loadMermaid();
  const html = md.render(inputEl.value);
  previewEl.innerHTML = html;
  if (previewEl.querySelector('.mermaid') && window.mermaid) {
    mermaid.run({ querySelector: '.mermaid', suppressErrors: true });
  }
}

let mermaidLoading = false;
function loadMermaid() {
  if (mermaidLoading || window.mermaid) return;
  mermaidLoading = true;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
  s.onload = () => {
    mermaidLoading = false;
    mermaid.initialize({ startOnLoad: false, suppressErrors: true, theme: mermaidTheme() });
    if (previewEl.querySelector('.mermaid')) {
      mermaid.run({ querySelector: '.mermaid', suppressErrors: true });
    }
  };
  s.onerror = () => { mermaidLoading = false; };
  document.head.appendChild(s);
}

function mermaidTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
}

function isMdFile(file) {
  return /\.md$/i.test(file.name);
}

function loadFile(file) {
  if (file.size > MAX_FILE_SIZE) { clearTimeout(inputEl._timer); inputEl.value = '# 文件过大（最大 5MB）'; render(); return; }
  const reader = new FileReader();
  reader.onload = () => {
    clearTimeout(inputEl._timer);
    inputEl.value = reader.result;
    render();
  };
  reader.onerror = () => { clearTimeout(inputEl._timer); inputEl.value = '# 读取文件失败'; render(); };
  reader.readAsText(file);
}

inputEl.addEventListener('input', () => {
  clearTimeout(inputEl._timer);
  inputEl._timer = setTimeout(() => requestAnimationFrame(render), 300);
});

document.getElementById('open-btn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0] && isMdFile(e.target.files[0])) loadFile(e.target.files[0]);
});

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && isMdFile(file)) loadFile(file);
});

document.addEventListener('paste', (e) => {
  const file = e.clipboardData.files[0];
  if (file && isMdFile(file)) { loadFile(file); return; }
  const text = e.clipboardData.getData('text');
  if (text && !e.target.closest('#input')) {
    clearTimeout(inputEl._timer);
    inputEl.value = text;
    render();
    inputEl.focus();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'o' && !e.target.closest('textarea')) {
    e.preventDefault();
    fileInput.click();
  }
});

const mq = window.matchMedia('(prefers-color-scheme: dark)');
function setTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, suppressErrors: true, theme: mermaidTheme() });
    render();
  }
}
setTheme(mq.matches);
mq.addEventListener('change', (e) => setTheme(e.matches));

themeBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(!isDark);
});

let isDragging = false;
divider.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = dropZone.getBoundingClientRect();
  let pct = ((e.clientX - rect.left) / rect.width) * 100;
  if (pct < 20) pct = 20;
  if (pct > 80) pct = 80;
  const el = document.querySelector('.panel:first-child');
  el.style.flex = 'none';
  el.style.width = pct + '%';
});
document.addEventListener('mouseup', () => { isDragging = false; });
document.addEventListener('mouseleave', () => { isDragging = false; });

document.getElementById('toggle-panel-btn').addEventListener('click', () => {
  document.querySelector('.main').classList.toggle('left-hidden');
});
