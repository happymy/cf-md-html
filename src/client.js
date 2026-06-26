import markdownit from 'markdown-it';
import footnote from 'markdown-it-footnote';
import taskLists from 'markdown-it-task-lists';
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
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const md = markdownit({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
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

const inputEl = document.getElementById('input');
const previewEl = document.getElementById('preview');
const themeBtn = document.getElementById('theme-btn');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');

function render() {
  const html = md.render(inputEl.value);
  previewEl.innerHTML = html;
}

function isMdFile(file) {
  return /\.md$/i.test(file.name);
}

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    inputEl.value = reader.result;
    render();
  };
  reader.onerror = () => {};
  reader.readAsText(file);
}

inputEl.addEventListener('input', render);

document.getElementById('open-btn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
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
    inputEl.value = text;
    render();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'o' && !e.target.closest('textarea')) {
    e.preventDefault();
    fileInput.click();
  }
});

themeBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? '🌙' : '☀️';
});
