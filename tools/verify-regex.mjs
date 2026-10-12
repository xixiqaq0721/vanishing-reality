// 构造正则验证件并跑 sillytavern-render-regex-pipeline 的三个工具。
//
// 两个要点：
// 1. 这里构造的是**运行时形态**的正则。项目里的 mvu-patch.json 用的是 replace_file
//    （打包期指令，把文件内容内联进 replaceString）；SillyTavern 运行时只认
//    replaceString，所以先做这一步内联，再验证替换行为。
// 2. 验证器要求 replaceString 非空，而隐藏脚本按工坊约定就是空串（"把整个匹配
//    替换为空"）。于是分两轮：替换脚本单独过结构校验，两条一起过 fixture 与 trace。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const here = import.meta.dirname;
const repoRoot = path.resolve(here, '..');
const projectDir = path.resolve(repoRoot, '..', 'cards', 'VanishingReality');
const outDir = path.join(projectDir, 'regex-evidence');
fs.mkdirSync(outDir, { recursive: true });

const skillDir = 'C:\\Users\\yu\\.dsh-beta\\skills\\sillytavern-render-regex-pipeline';
const scriptPath = name => path.join(skillDir, 'scripts', name);
const outPath = name => path.join(outDir, name);

function runTool(script, args) {
  try {
    return JSON.parse(
      execFileSync(process.execPath, [scriptPath(script), ...args], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      }),
    );
  } catch (e) {
    // 验证器在有 error 时以非零码退出，但 stdout 仍是完整 JSON 报告
    if (e.stdout) return JSON.parse(e.stdout);
    throw e;
  }
}

// ---- 1) 把 replace_file 内联成运行时的 replaceString ----
const inlineHtml = fs.readFileSync(path.join(projectDir, '正则', '状态栏界面.html'), 'utf8').trimEnd();
const patch = JSON.parse(fs.readFileSync(path.join(projectDir, 'mvu-patch.json'), 'utf8'));

const rules = patch.map(entry => {
  const v = entry.value;
  return {
    id: v.id,
    scriptName: v.scriptName,
    findRegex: v.findRegex,
    replaceString: v.replace_file ? inlineHtml : (v.replaceString ?? ''),
    trimStrings: v.trimStrings ?? [],
    placement: v.placement,
    disabled: v.disabled,
    markdownOnly: v.markdownOnly,
    promptOnly: v.promptOnly,
    runOnEdit: v.runOnEdit,
    substituteRegex: v.substituteRegex,
  };
});
fs.writeFileSync(outPath('regex.runtime.json'), JSON.stringify(rules, null, 2) + '\n', 'utf8');
fs.writeFileSync(outPath('regex.replace-only.json'), JSON.stringify([rules[1]], null, 2) + '\n', 'utf8');

const hazards = ['$$', '$&', '$`', "$'"].filter(h => inlineHtml.includes(h));
console.log('替换串危险序列: ' + (hazards.length ? hazards.join(' ') : '无'));
console.log('内联后的替换串长度: ' + inlineHtml.length + ' B');
console.log('');

// ---- 2) fixture：占位符在两个 destination 下各走哪条规则 ----
const 正文 = [
  '校庭西侧的空气先一步凉下来。铁丝网的格子歪了半格，像是有人从后面推过。',
  '她站在缺口前，把手机举到与视线齐平的位置。',
  '',
  '<StatusPlaceHolderImpl/>',
].join('\n');

const fixtures = {
  schemaVersion: 1,
  cases: [
    {
      id: 'display-占位符替换为界面',
      input: 正文,
      placement: 2,
      destination: 'display',
      depth: 1,
      expected: 正文.replace('<StatusPlaceHolderImpl/>', inlineHtml),
    },
    {
      id: 'prompt-占位符被隐藏',
      input: 正文,
      placement: 2,
      destination: 'prompt',
      depth: 1,
      expected: 正文.replace('<StatusPlaceHolderImpl/>', ''),
    },
  ],
};
fs.writeFileSync(outPath('fixtures.json'), JSON.stringify(fixtures, null, 2) + '\n', 'utf8');

// ---- 3) 结构校验：替换脚本单独过 ----
const onlyReplace = runTool('validate-tavern-regex.mjs', [outPath('regex.replace-only.json')]);
fs.writeFileSync(outPath('report.validate-replace.json'), JSON.stringify(onlyReplace, null, 2) + '\n', 'utf8');
console.log('结构校验（替换脚本单独）: errors=' + onlyReplace.errors.length + ' warnings=' + onlyReplace.warnings.length);
onlyReplace.errors.forEach(x => console.log('   ERROR ' + x));

// ---- 4) 结构校验：两条一起（预期命中验证器对空替换串的限制）----
const full = runTool('validate-tavern-regex.mjs', [outPath('regex.runtime.json')]);
fs.writeFileSync(outPath('report.validate-full.json'), JSON.stringify(full, null, 2) + '\n', 'utf8');
console.log('结构校验（两条一起）  : errors=' + full.errors.length + ' warnings=' + full.warnings.length);
full.errors.forEach(x => console.log('   ERROR ' + x));

// 隐藏脚本的结构断言（验证器覆盖不到，这里自己断言）
const hide = rules[0];
const 断言 = [
  ['隐藏脚本 replaceString 为空串', hide.replaceString === ''],
  ['隐藏脚本 promptOnly = true', hide.promptOnly === true],
  ['隐藏脚本 markdownOnly = false', hide.markdownOnly === false],
  ['隐藏脚本 placement 含 2', hide.placement.includes(2)],
  ['隐藏脚本 runOnEdit = true', hide.runOnEdit === true],
  ['隐藏脚本 substituteRegex = 0', hide.substituteRegex === 0],
  ['两条 findRegex 一致', rules[0].findRegex === rules[1].findRegex],
  ['两条 id 不同', rules[0].id !== rules[1].id],
  ['替换脚本 markdownOnly = true', rules[1].markdownOnly === true],
  ['替换脚本 promptOnly = false', rules[1].promptOnly === false],
];
console.log('');
console.log('隐藏脚本结构断言:');
let 断言失败 = 0;
for (const [label, ok] of 断言) {
  if (!ok) 断言失败 += 1;
  console.log('   ' + (ok ? 'PASS' : 'FAIL') + '  ' + label);
}

// ---- 5) fixture 与 trace ----
const fx = runTool('run-regex-fixtures.mjs', ['--regex', outPath('regex.runtime.json'), '--fixtures', outPath('fixtures.json')]);
fs.writeFileSync(outPath('report.fixtures.json'), JSON.stringify(fx, null, 2) + '\n', 'utf8');
console.log('');
console.log('fixture 运行: ' + fx.passed + '/' + fx.caseCount + ' 通过, failed=' + fx.failed);
fx.results.forEach(r =>
  console.log('   [' + (r.pass ? 'PASS' : 'FAIL') + '] ' + r.id + '  → 输出 ' + r.output.length + ' B'),
);

const tr = runTool('trace-render-pipeline.mjs', ['--regex', outPath('regex.runtime.json'), '--fixtures', outPath('fixtures.json')]);
fs.writeFileSync(outPath('report.trace.json'), JSON.stringify(tr, null, 2) + '\n', 'utf8');
console.log('阶段 trace 已写出: report.trace.json');

const 结论ok = onlyReplace.errors.length === 0 && full.errors.length <= 1 && fx.failed === 0 && 断言失败 === 0;
console.log('');
console.log('总判定: ' + (结论ok ? 'PASS' : 'ATTENTION'));
console.log('产物目录 ' + outDir);
