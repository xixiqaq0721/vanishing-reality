// 离线预览生成器：把 dist 产物包成一张可直接在浏览器里打开的页面。
//
// 酒馆助手在真实运行时会在 iframe 里预注入 jquery / lodash / Vue，并由 MVU 框架
// 提供 zod 全局 z，同时给出 getVariables、updateVariablesWith、waitGlobalInitialized
// 等接口。这里用等价的最小桩件替代它们，好让界面在没有酒馆的情况下也能渲染出来，
// 用于构建后的渲染验收（截图）与看报错。
//
// 产物里唯一的外链 ESM（pinia、async-wait-until）依旧走 jsdelivr，与真实运行一致。
//
// 用法：node tools/make-preview.mjs [fixture.json]
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist', 'VanishingReality', '界面', '状态栏', 'index.html');
const outDir = path.join(root, 'tools', 'preview');

const src = fs.readFileSync(dist, 'utf8');

// 产物结构固定：一个 <script type="module">（打包结果）+ 一个 <style> + 空壳 body。
const scriptMatch = src.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error('产物里找不到内联脚本：' + dist);
const bundle = scriptMatch[1];

const styleMatch = src.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
const style = styleMatch ? styleMatch[1] : '';

// 桩数据：空对象即可 —— schema 每个字段都带默认值，parse 之后就是完整初始态。
// 传 fixture 路径时用它覆盖（例如把某位少女的侵蚀度推过灾祸线）。
const fixturePath = process.argv[2];
const fixture = fixturePath ? JSON.parse(fs.readFileSync(fixturePath, 'utf8')) : {};

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vanishing Reality · 状态栏离线预览</title>
<link rel="stylesheet" href="https://testingcf.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css">
<style>${style}</style>
<style>
  html, body { margin: 0; padding: 0; background: #0b0710; }
  body { padding: 12px; }
</style>
<script src="https://testingcf.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>
<script src="https://testingcf.jsdelivr.net/npm/lodash@4/lodash.min.js"></script>
<script src="https://testingcf.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
</head>
<body>
<div id="app"></div>

<script>
(function () {
  // 诊断面板：渲染失败时错误直接落在截图里，不必去翻控制台。
  var diag = [];
  function paint() {
    var el = document.getElementById('__vr_diag');
    if (!el) {
      el = document.createElement('div');
      el.id = '__vr_diag';
      el.style.cssText =
        'position:fixed;left:0;bottom:0;right:0;z-index:99999;padding:6px 8px;' +
        'background:#7a0020;color:#fff;font:11px/1.45 monospace;white-space:pre-wrap;';
      document.body.appendChild(el);
    }
    el.textContent = diag.join('\\n');
  }
  function note(msg) { diag.push(msg); paint(); }
  window.__vr_note = note;
  window.__vr_diag_lines = diag;

  window.addEventListener('error', function (e) {
    var where = e.filename ? '  @ ' + e.filename.split('/').pop() : '';
    note('ERROR: ' + (e.message || e.type) + where);
    var stack = e.error && e.error.stack;
    if (stack) {
      String(stack)
        .split('\\n')
        .slice(0, 4)
        .forEach(function (line) { note('   ' + line.trim().slice(0, 190)); });
    }
  });
  window.addEventListener('unhandledrejection', function (e) {
    note('REJECT: ' + ((e.reason && e.reason.message) || e.reason));
  });
  var origError = console.error;
  console.error = function () {
    note('console.error: ' + Array.prototype.join.call(arguments, ' '));
    return origError.apply(console, arguments);
  };

  // ---- 酒馆助手 / MVU 接口桩件 ----
  // 预览专用：?tab=power|field 直接落到指定页签，方便逐页截图取证。
  try {
    var tab = new URLSearchParams(location.search).get('tab');
    if (tab) localStorage.setItem('vanishing_reality:tab', tab);
  } catch (e) {}

  var STAT = ${JSON.stringify(fixture)};
  window.__VR_STAT__ = STAT;
  window.getVariables = function () { return { stat_data: STAT }; };
  window.replaceVariables = function () {};
  window.updateVariablesWith = function () { return Promise.resolve(); };
  window.insertOrAssignVariables = function () {};
  window.waitGlobalInitialized = function (name) {
    window[name] = window[name] || {};
    return Promise.resolve();
  };
  window.getCurrentMessageId = function () { return 0; };
  window.getIframeName = function () { return 'vr-preview'; };
  window.errorCatched = function (fn) { return fn; };
  window.toastr = { success: function () {}, error: function () {}, warning: function () {}, info: function () {} };
  window.tavern_events = {};
  window.eventOn = function () { return { stop: function () {} }; };
  window.Mvu = { events: {}, getMvuData: function () { return { stat_data: STAT }; } };
  window.SillyTavern = { getCurrentChatId: function () { return 'preview'; } };
})();
</script>

<!-- zod 由 MVU 框架以全局 z 提供，这里用本地安装的同一版本补上，再跑打包产物。 -->
<script type="module">
import * as zodNs from '/vendor/zod/index.js';
// 产物把 zod 外部化成全局 z，并按 A.z.object 取用 —— 即命名空间的 z 导出，
// 所以这里要挂整个命名空间，而不是命名空间里的 z。
window.z = zodNs;
var NEEDED = ['$', '_', 'Vue', 'z', 'toastr', 'VueRouter', 'YAML', 'showdown', 'Mvu', 'TavernHelper'];
if (window.__vr_note) {
  window.__vr_note(
    'globals: ' +
      NEEDED.map(function (k) { return k + '=' + (typeof window[k]); }).join(' ') +
      '  z.object=' + (window.z && typeof window.z.object) +
      '  z.z.object=' + (window.z && window.z.z && typeof window.z.z.object),
  );
}
await import('./bundle.js');
</script>
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(outDir, 'bundle.js'), bundle, 'utf8');
console.log('preview written: ' + outDir + '  (html ' + html.length + ' B, bundle ' + bundle.length + ' B)');
