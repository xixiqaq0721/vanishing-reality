// 端到端验证：用**真实交付的 CDN 正则内容**跑一遍完整链路。
//
// 链路：酒馆助手预注入的库 → 正则替换出的加载块 → jQuery 拉 CDN 产物 → 界面渲染。
// 重点验证一个不能靠推理下结论的地方：产物把 <style> 与 <script type="module">
// 都放在 <head> 里，而 $('body').load() 只往 body 里塞内容 —— 会不会被丢掉。
//
// 结果通过 POST /report 回传落盘（页面 body 可能被替换，不能依赖页面内显示）。
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = n => {
  const i = argv.indexOf('--' + n);
  return i >= 0 ? argv[i + 1] : undefined;
};
const user = arg('user') || 'xixiqaq0721';
const repo = arg('repo') || 'vanishing-reality';
const ref = arg('ref') || 'main';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, 'tools', 'preview');
fs.mkdirSync(outDir, { recursive: true });

// 直接取交付用的 CDN 正则内容，去掉首尾三反引号围栏 —— 用真件，不用仿件
const cdnFile = path.resolve(repoRoot, '..', 'cards', 'VanishingReality', '正则', '状态栏界面.cdn.html');
const raw = fs.readFileSync(cdnFile, 'utf8').split('\n');
const loader = raw
  .filter((_, i) => i !== 0 && i !== raw.length - 2)
  .join('\n')
  .trim();
console.log('取自   ' + cdnFile);
console.log('加载块 ' + loader.replace(/\s+/g, ' ').slice(0, 120));

const cdnUrl = `https://testingcf.jsdelivr.net/gh/${user}/${repo}@${ref}/dist/VanishingReality/界面/状态栏/index.html`;

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>端到端：正则 → CDN → 界面</title>
<!-- 酒馆助手在 iframe 里预注入的东西 -->
<script src="https://testingcf.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>
<script src="https://testingcf.jsdelivr.net/npm/lodash@4/lodash.min.js"></script>
<script src="https://testingcf.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
<script>
// 酒馆助手 / MVU 接口桩件
(function () {
  var STAT = {};
  window.getVariables = function () { return { stat_data: STAT }; };
  window.replaceVariables = function () {};
  window.updateVariablesWith = function () { return Promise.resolve(); };
  window.insertOrAssignVariables = function () {};
  window.waitGlobalInitialized = function (n) { window[n] = window[n] || {}; return Promise.resolve(); };
  window.getCurrentMessageId = function () { return 0; };
  window.getIframeName = function () { return 'vr-e2e'; };
  window.errorCatched = function (fn) { return fn; };
  window.toastr = { success: function () {}, error: function () {}, warning: function () {}, info: function () {} };
  window.tavern_events = {};
  window.eventOn = function () { return { stop: function () {} }; };
  window.Mvu = { events: {}, getMvuData: function () { return { stat_data: STAT }; } };
  window.SillyTavern = { getCurrentChatId: function () { return 'e2e'; } };
})();
// body 会被 .load() 替换，所以错误钩子挂在 window 上、结果另行回传
(function () {
  var notes = [];
  window.__e2e = notes;
  window.addEventListener('error', function (e) { notes.push('ERROR: ' + (e.message || e.type)); });
  window.addEventListener('unhandledrejection', function (e) {
    notes.push('REJECT: ' + ((e.reason && e.reason.message) || e.reason));
  });
  var orig = console.error;
  console.error = function () { notes.push('console.error: ' + Array.prototype.join.call(arguments, ' ')); return orig.apply(console, arguments); };
})();
</script>
<script type="module">
import * as zodNs from '/vendor/zod/index.js';
window.z = zodNs;
</script>
</head>
<body>
<!-- ↓↓↓ 以下是 正则/状态栏界面.cdn.html 的原文（已去围栏），来自交付件 ↓↓↓ -->
${loader}
<!-- ↑↑↑ 交付件原文结束 ↑↑↑ -->

<script>
// .load() 是异步的，等它把界面塞进来之后再量测并回传
setTimeout(function () {
  var app = document.getElementById('app');
  var styleCount = document.querySelectorAll('style').length;
  var moduleScripts = document.querySelectorAll('script[type="module"]').length;
  var maiden = document.querySelectorAll('[class*="maiden"]').length;
  var hud = document.querySelector('.hud');
  var report = {
    采样时间: new Date().toISOString(),
    cdn地址: ${JSON.stringify(cdnUrl)},
    应用节点存在: !!app,
    应用已挂载: !!(app && app.children.length > 0),
    界面根容器: !!hud,
    少女卡数量: maiden,
    style标签数: styleCount,
    module脚本数: moduleScripts,
    页面可见文本前120字: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 120),
    错误: window.__e2e,
    判定: (app && app.children.length > 0 && maiden >= 4) ? 'PASS —— 交付链路端到端可用' : 'FAIL —— 界面未渲染出来',
  };
  fetch('/report?name=e2e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report, null, 2) })
    .catch(function () {});
  document.title = report.判定;
}, 9000);
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'e2e-cdn.html'), html, 'utf8');
console.log('e2e 页面 ' + path.join(outDir, 'e2e-cdn.html'));
console.log('CDN     ' + cdnUrl);
