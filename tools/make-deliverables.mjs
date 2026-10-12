// 从构建产物生成项目侧的交付文件：
//   1. 正则/状态栏界面.html        —— 全量内联版，不依赖 GitHub，导入即可用
//   2. 正则/状态栏界面.cdn.html    —— CDN 版，坐标齐了就填实
//   3. mvu-patch.json              —— 隐藏脚本 + 替换脚本两条正则的注册补丁
//
// 正则文件结构按 tavern-cards/references/ui/regex-scripts.md：含 <body> 的前端界面
// 必须用首尾各一行纯三反引号围成独立代码块。
//
// 用法：
//   node tools/make-deliverables.mjs                     仅出占位符版
//   node tools/make-deliverables.mjs --user X --repo Y   同时填实 CDN 坐标
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// ---- 参数 ----
const argv = process.argv.slice(2);
const arg = name => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const ghUser = arg('user');
const ghRepo = arg('repo');
const hasCoords = Boolean(ghUser && ghRepo);

const repoRoot = path.resolve(import.meta.dirname, '..');
const project = 'VanishingReality';
const distFile = path.join(repoRoot, 'dist', project, '界面', '状态栏', 'index.html');
const outDir = path.resolve(repoRoot, '..', 'cards', project);
const regexDir = path.join(outDir, '正则');

const built = fs.readFileSync(distFile, 'utf8').trimEnd();
const FENCE = '```';

fs.mkdirSync(regexDir, { recursive: true });

// 1) 内联版
const inline = [FENCE, built, FENCE, ''].join('\n');
fs.writeFileSync(path.join(regexDir, '状态栏界面.html'), inline, 'utf8');

// 2) CDN 版
const ghPath = `dist/${project}/界面/状态栏/index.html`;
const cdnUrl = hasCoords
  ? `https://testingcf.jsdelivr.net/gh/${ghUser}/${ghRepo}@main/${ghPath}`
  : `https://testingcf.jsdelivr.net/gh/{GH_USER}/{GH_REPO}/${ghPath}`;
const cdn = [
  FENCE,
  '<body>',
  '<script>',
  `$('body').load('${cdnUrl}')`,
  '</script>',
  '</body>',
  FENCE,
  '',
].join('\n');
fs.writeFileSync(path.join(regexDir, '状态栏界面.cdn.html'), cdn, 'utf8');

// 3) 正则脚本注册补丁
// id 必须确定性：由脚本名派生（UUIDv5 思路，SHA-1 截断后补版本位）。
// 每次重跑都重摇 UUID 会让正则取证与补丁对不上，也让 diff 每轮都脏。
function 确定性id(名) {
  const h = crypto.createHash('sha1').update('VanishingReality:' + 名, 'utf8').digest('hex').slice(0, 32);
  const s = h.slice(0, 12) + '5' + h.slice(13, 16) + '8' + h.slice(17);
  return [s.slice(0, 8), s.slice(8, 12), s.slice(12, 16), s.slice(16, 20), s.slice(20, 32)].join('-');
}
const 隐藏id = 确定性id('对AI隐藏侵渊状态栏');
const 替换id = 确定性id('侵渊状态栏界面');
const patch = [
  {
    op: 'add',
    path: '/regex_scripts/对AI隐藏侵渊状态栏',
    value: {
      id: 隐藏id,
      scriptName: '对AI隐藏侵渊状态栏',
      findRegex: '<StatusPlaceHolderImpl/>',
      replaceString: '',
      trimStrings: [],
      placement: [2],
      disabled: false,
      markdownOnly: false,
      promptOnly: true,
      runOnEdit: true,
      substituteRegex: 0,
    },
  },
  {
    op: 'add',
    path: '/regex_scripts/侵渊状态栏界面',
    value: {
      id: 替换id,
      scriptName: '侵渊状态栏界面',
      findRegex: '<StatusPlaceHolderImpl/>',
      replace_file: '正则/状态栏界面.html',
      trimStrings: [],
      placement: [2],
      disabled: false,
      markdownOnly: true,
      promptOnly: false,
      runOnEdit: true,
      substituteRegex: 0,
    },
  },
];
fs.writeFileSync(path.join(outDir, 'mvu-patch.json'), JSON.stringify(patch, null, 2) + '\n', 'utf8');

console.log('内联版   ' + path.join(regexDir, '状态栏界面.html') + '  (' + inline.length + ' B)');
console.log('CDN 版   ' + path.join(regexDir, '状态栏界面.cdn.html') + '  (' + cdn.length + ' B)');
console.log('补丁     ' + path.join(outDir, 'mvu-patch.json'));
console.log('隐藏脚本 id = ' + 隐藏id);
console.log('替换脚本 id = ' + 替换id);
