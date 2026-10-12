// 校验 jsdelivr 是否真的按预期提供了构建产物。
//
// 只看 HTTP 200 不够：CDN 可能给了旧缓存、错误文件或截断内容。这里把远端取回的
// 字节与本地 dist 产物做 sha256 对比，逐字节确认。
//
// 用法：
//   node tools/verify-cdn.mjs --user <GH_USER> --repo <GH_REPO> [--ref main]
//   node tools/verify-cdn.mjs --user X --repo Y --ref <sha>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const arg = name => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const user = arg('user');
const repo = arg('repo');
const ref = arg('ref') || 'main';
if (!user || !repo) {
  console.error('usage: --user <GH_USER> --repo <GH_REPO> [--ref main|<sha>]');
  process.exit(2);
}

const repoRoot = path.resolve(import.meta.dirname, '..');
const ghPath = 'dist/VanishingReality/界面/状态栏/index.html';
const localFile = path.join(repoRoot, 'dist', 'VanishingReality', '界面', '状态栏', 'index.html');

const local = fs.readFileSync(localFile);
const localHash = crypto.createHash('sha256').update(local).digest('hex');
console.log('本地 dist  ' + local.length + ' B   sha256 ' + localHash.slice(0, 20) + '…');

const url = `https://testingcf.jsdelivr.net/gh/${user}/${repo}@${ref}/${ghPath}`;
console.log('CDN 地址   ' + url);
console.log('');

let ok = false;
try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timer);
  const body = Buffer.from(await res.arrayBuffer());
  const hash = crypto.createHash('sha256').update(body).digest('hex');

  console.log('HTTP       ' + res.status + ' ' + res.statusText);
  console.log('远端 sha256 ' + hash.slice(0, 20) + '…   长度 ' + body.length + ' B');
  if (res.ok && hash === localHash) {
    ok = true;
    console.log('判定       PASS —— 逐字节一致');
  } else if (res.ok) {
    console.log('判定       FAIL —— 长度或内容与本地不符');
    console.log('           远端首行: ' + body.toString('utf8').split('\n')[0].slice(0, 120));
  } else {
    console.log('判定       FAIL —— 远端未提供该文件');
    console.log('           响应前 200 字: ' + body.toString('utf8').replace(/\s+/g, ' ').slice(0, 200));
  }
} catch (e) {
  console.log('判定       FAIL —— 请求异常: ' + e.message);
}

process.exitCode = ok ? 0 : 1;
