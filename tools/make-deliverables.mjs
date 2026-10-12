// 从构建产物生成项目侧的交付文件：
//   1. 正则/状态栏界面.html        —— 全量内联版，不依赖 GitHub，导入即可用
//   2. 正则/状态栏界面.cdn.html    —— CDN 版，填好 {GH_USER}/{GH_REPO} 后替换前者
//   3. mvu-patch.json              —— 隐藏脚本 + 替换脚本两条正则的注册补丁
//
// 正则文件结构按 tavern-cards/references/ui/regex-scripts.md：含 <body> 的前端界面
// 必须用首尾各一行纯三反引号围成独立代码块。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

// 2) CDN 版（占位符待填）
const cdnUrl = `https://testingcf.jsdelivr.net/gh/{GH_USER}/{GH_REPO}/dist/${project}/界面/状态栏/index.html`;
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
const 隐藏id = crypto.randomUUID();
const 替换id = crypto.randomUUID();
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
