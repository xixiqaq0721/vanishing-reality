// 生成 iframe 宿主量测页。
//
// 截图只能证明「独立页面里好看」，证不了酒馆助手把界面塞进 iframe 之后的表现。
// 这个宿主页把产物放进真正同源的 <iframe> 里，读取 contentDocument 的实际几何，
// 再把结果 POST 回本地服务落盘，得到机器可读的证据。
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(import.meta.dirname, 'preview');
fs.mkdirSync(outDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>iframe 宿主量测</title>
<style>
  body { margin: 0; padding: 10px; background: #0b0710; color: #eadff5;
         font: 13px/1.5 ui-monospace, Consolas, monospace; }
  h2 { font-size: 13px; margin: 4px 0 6px; color: #ffd9ec; }
  .row { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
  .slot { border: 1px dashed #4a2c66; padding: 4px; }
  .slot > span { display: block; font-size: 11px; color: #9d86b8; margin-bottom: 3px; }
  iframe { border: 0; display: block; background: #120a1b; }
  #out { white-space: pre-wrap; margin-top: 10px; font-size: 12px; }
</style>
</head>
<body>
<h2>iframe 宿主量测（同源，可读 contentDocument）</h2>
<div class="row">
  <div class="slot"><span>宽 700px（桌面消息楼层）</span><iframe id="f700" src="./index.html" width="700" height="600"></iframe></div>
  <div class="slot"><span>宽 360px（窄屏）</span><iframe id="f360" src="./index.html" width="360" height="600"></iframe></div>
</div>
<div id="out">measuring…</div>

<script>
function measure(id) {
  var f = document.getElementById(id);
  var d = f.contentDocument;
  if (!d || !d.documentElement) return { id: id, error: 'contentDocument 不可读' };
  var de = d.documentElement;
  var body = d.body;
  var app = d.getElementById('app');
  return {
    id: id,
    视口宽: f.clientWidth,
    文档scrollWidth: de.scrollWidth,
    文档scrollHeight: de.scrollHeight,
    正文scrollHeight: body ? body.scrollHeight : null,
    横向溢出: de.scrollWidth > f.clientWidth + 1,
    实际内容高: app ? Math.round(app.getBoundingClientRect().height) : null,
    应用已挂载: !!(app && app.children.length > 0),
    诊断面板: d.getElementById('__vr_diag') ? d.getElementById('__vr_diag').textContent.slice(0, 160) : null,
  };
}

function collect() {
  var result = { 采样时间: new Date().toISOString(), 视口: [measure('f700'), measure('f360')] };
  var text = JSON.stringify(result, null, 2);
  document.getElementById('out').textContent = text;
  fetch('/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: text,
  }).catch(function () {});
  document.title = 'measured';
}
window.addEventListener('load', function () { setTimeout(collect, 6000); });
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'host.html'), html, 'utf8');
console.log('host written: ' + path.join(outDir, 'host.html'));
