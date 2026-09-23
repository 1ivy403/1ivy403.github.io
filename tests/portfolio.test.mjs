import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

async function readSiteFile(name) {
  try {
    return await readFile(resolve(root, name), 'utf8');
  } catch {
    return '';
  }
}

const [html, css, js] = await Promise.all([
  readSiteFile('index.html'),
  readSiteFile('styles.css'),
  readSiteFile('script.js'),
]);

test('浏览器标题和分享预览标明居丽德孜-AI产品经理', () => {
  assert.match(html, /<title>居丽德孜-AI产品经理<\/title>/);
  assert.match(html, /<meta property="og:title" content="居丽德孜-AI产品经理">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/1ivy403\.github\.io\/">/);
});

test('首屏保留人物自述，四个色块呈现定位而不重复长句', () => {
  assert.match(html, /AI 产品经理 · Agent 与大模型应用/);
  assert.match(html, /<h1 id="hero-title">\s*<span class="hero-emphasis">从真实问题出发，<\/span><br>\s*把模型能力转化为可验证的<span class="hero-mark">产品结果。<\/span>\s*<\/h1>/);
  const heroTitle = html.match(/<h1 id="hero-title">([\s\S]*?)<\/h1>/)?.[1] ?? '';
  assert.doesNotMatch(heroTitle, /Hi,我是孜孜|我定义场景和问题/);
  assert.match(html, /嗨，我是居丽德孜。我关注的不只是“AI 能做什么”，更在意它能否进入真实场景、推动用户完成下一步，并通过评测与业务结果验证价值。/);
  assert.doesNotMatch(html, /class="hero-position"|AI Native 产品经理｜3 段 Agent \/ 大模型应用实习｜2 年海外增长经验｜黑客松第一｜ENFJ/);
  const proofBand = html.match(/<section class="proof-band"[\s\S]*?<\/section>/)?.[0] ?? '';
  for (const phrase of ['AI Native', '产品经理', '3 段', 'Agent / 大模型应用实习', '2 年', '海外增长经验', '黑客松第一']) {
    assert.ok(proofBand.includes(phrase), `missing positioning: ${phrase}`);
  }
  assert.doesNotMatch(proofBand, /2\.2 万|\+10\.8%|\+30%|第 1 名/);
});

test('首屏按姓名导航、圆形头像、角色、主张、入口、成果排列', () => {
  assert.match(html, /class="hero-badge"/);
  assert.match(html, /class="hero-statement">[\s\S]*?<h1 id="hero-title">[\s\S]*?<p class="hero-intro">[\s\S]*?<\/div>/);
  assert.match(css, /\.hero-statement\s*\{[^}]*padding-left:\s*2\.5rem;[^}]*text-align:\s*left/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*?\.hero-statement\s*\{[^}]*padding-left:\s*1rem/);
  assert.match(html, /class="hero-portrait"[\s\S]*?life-photo\.jpg[\s\S]*?Hi,我是孜孜/);
  assert.match(html, /class="link-button link-button-primary hero-primary"/);
  assert.match(html, /class="link-button hero-secondary external-link"[\s\S]*?GitHub/);
  const positions = ['class="site-header"', 'class="hero-portrait"', 'class="hero-badge"', 'id="hero-title"', 'class="hero-actions"', 'class="proof-band"'].map((part) => html.indexOf(part));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(css, /\.hero-portrait img\s*\{[^}]*border-radius:\s*50%/);
  assert.match(css, /\.hero-portrait img\s*\{[^}]*height:\s*var\(--avatar-size\)/);
  assert.match(css, /\.hero-portrait\s*\{[^}]*--avatar-size:\s*140px/);
  assert.match(css, /\.hero-portrait figcaption\s*\{[^}]*position:\s*absolute;[^}]*bottom:\s*-\d+px/);
  assert.equal((html.match(/class="proof-item"/g) ?? []).length, 4);
  assert.match(css, /\.proof-item:nth-child\(1\)[\s\S]*?var\(--yellow\)/);
  assert.match(css, /\.proof-item:nth-child\(2\)[\s\S]*?var\(--blue\)/);
  assert.match(css, /\.proof-item:nth-child\(3\)[\s\S]*?var\(--pink\)/);
  assert.match(css, /\.proof-item:nth-child\(4\)[\s\S]*?var\(--green\)/);
});

test('作品严格按问小鲸、搜救犬、Mochi 排列', () => {
  const projects = [
    'data-project="wenxiaojing"',
    'data-project="rescue"',
    'data-project="mochi"',
  ];
  const positions = projects.map((project) => html.indexOf(project));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(html, /<h3>多模态搜救机械犬“小安”<\/h3>/);
  assert.doesNotMatch(html, /全景感知搜救机械犬“小安”/);
  assert.doesNotMatch(html, /三个项目，三种把 AI 放进真实场景的方法。/);
  const rescue = html.match(/<article class="project-card project-rescue"[\s\S]*?<article class="project-card project-mochi"/)?.[0] ?? '';
  assert.match(rescue, /<strong>端到端<\/strong> 演示闭环[\s\S]*?<strong>第 1 名<\/strong>[\s\S]*?获新华社客户端及[\s\S]*?张越视频号[\s\S]*?采访报道/);
  assert.match(rescue, /https:\/\/weixin\.qq\.com\/sph\/AYOYi4zrzW/);
});

test('项目文案呈现问题判断、方案选择和验证闭环，且不含未获履历支持的表述', () => {
  const wenxiaojing = html.match(/<article[^>]*data-project="wenxiaojing"[\s\S]*?<article class="project-card project-rescue"/)?.[0] ?? '';
  assert.match(wenxiaojing, /课程完课率低/);
  assert.match(wenxiaojing, /运营长期重复低质量答疑、学习者缺乏及时有效卡点引导/);
  for (const step of ['分层教学策略', '结构化输出约束', '多轮教学闭环', 'P0\/P1 评测回归']) {
    assert.match(wenxiaojing, new RegExp(step));
  }

  const rescue = html.match(/<article class="project-card project-rescue"[\s\S]*?<article class="project-card project-mochi"/)?.[0] ?? '';
  assert.match(rescue, /机器狗 \+ 360°全景相机 \+ 多模态 AI/);
  for (const step of ['YOLOv4 人员检测', 'Cohere 语音转写', '3D 全景转 2D', '决策辅助']) {
    assert.match(rescue, new RegExp(step));
  }

  assert.match(html, /巴基斯坦区域语音房经营分析流程产品化/);
  assert.doesNotMatch(html, /独立负责上下文伴学模块 0→1|带领 3 人团队|72h|5 万月活语音房/);
});

test('个人制作的小工具紧接主项目，情报雷达指向公开历史简报', () => {
  const mochi = html.indexOf('data-project="mochi"');
  const tools = html.indexOf('id="tools"');
  const career = html.indexOf('id="career"');
  assert.ok(mochi >= 0 && mochi < tools && tools < career);
  const toolSection = html.slice(tools, career);
  assert.match(toolSection, /个人制作的小工具/);
  assert.match(toolSection, /AIPM Radar · AI 产品情报雷达/);
  assert.match(toolSection, /基于 TrendRadar/);
  assert.match(toolSection, /https:\/\/1ivy403\.github\.io\/ai-intelligence-radar-site\/#briefing/);
  assert.match(toolSection, /查看历史简报/);
  assert.doesNotMatch(toolSection, /实时订阅|开放订阅/);
});

test('页面不包含被删除的模块和下载简历', () => {
  assert.doesNotMatch(html, /读得最多|大家读得最多的文章|下载简历|个人经历/);
});

test('当前状态只有在读和在职两条', () => {
  const statuses = html.match(/data-current-status/g) ?? [];
  assert.equal(statuses.length, 2);
  assert.match(html, /<section id="status"[^>]*aria-labelledby="status-title"/);
  assert.match(html, /<section id="skills"[^>]*aria-labelledby="skills-title"/);
  assert.match(html, /href="#status">当前状态<\/a>/);
  assert.match(html, /<h2 id="status-title">当前状态<\/h2>/);
  assert.match(html, /<h2 id="skills-title">技能<\/h2>/);
  assert.doesNotMatch(html, /现在与技能树|少一点名词，多一点真的会做。/);
  assert.match(html, /香港城市大学硕士在读/);
  assert.match(html, /Datawhale AI 产品经理/);
});

test('当前状态位于项目之前，导航顺序与页面一致', () => {
  const status = html.indexOf('<section id="status"');
  const projects = html.indexOf('<section id="projects"');
  const career = html.indexOf('<section id="career"');
  assert.ok(status >= 0 && status < projects && projects < career);
  assert.match(html, /href="#status">当前状态<\/a>[\s\S]*?href="#projects">项目<\/a>[\s\S]*?href="#career">履历<\/a>/);
  assert.match(html.slice(status, projects), /<span class="section-number">01<\/span>/);
  assert.match(html.slice(projects, career), /<span class="section-number">02<\/span>/);
  assert.match(html.slice(career), /<span class="section-number">03<\/span>/);
});

test('技能区保留一处马斯克引语，不重复解释口号', () => {
  const tastePanel = html.match(/<div class="taste-panel">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.match(tastePanel, /I think it's also important to reason from first principles, rather than by analogy\./);
  assert.doesNotMatch(tastePanel, /从第一性原理推理，而不是依靠类比/);
  assert.match(tastePanel, /Elon Musk/);
  assert.match(tastePanel, /https:\/\/jamesclear\.com\/first-principles/);
  assert.equal((tastePanel.match(/<blockquote>/g) ?? []).length, 1);
  assert.doesNotMatch(tastePanel, /The hottest new programming language is English|需求写得像谜语|taste-answer/);
  assert.doesNotMatch(html, /hero-quote-source|hero-quote-emphasis/);
});

test('能力与工作台包含工具、人类技能和 AI taste', () => {
  for (const term of [
    'Claude Code',
    'Codex',
    'Figma',
    'Supabase',
    'English',
    '主持',
    'CUBA',
    '扭脖子',
    'Ctrl+C / Ctrl+V',
    "I think it's also important to reason from first principles, rather than by analogy.",
  ]) {
    assert.match(html, new RegExp(term.replace(/[+]/g, '\\+')));
  }
  assert.doesNotMatch(html, /data-skill=|class="skill-tabs"|class="workbench-index"/);
  assert.match(html, /产品设计与 AI 应用/);
  assert.match(html, /社会学 \/ 英语双学位/);
  assert.match(html, /哈萨克语/);
  assert.match(html, /特殊语言技能：可与小猫小狗无痛交流/);
  assert.doesNotMatch(html, /也可以和小猫小狗无痛交友|把模型放进用户的下一步，而不是让用户适应模型。/);
  assert.match(html, /<h3>校级主持人<\/h3>/);
  assert.match(html, /<h3>CUBA 亚军<\/h3>/);
  assert.match(html, /大前锋/);
  assert.match(html, /新疆哈萨克族出厂配置。/);
  assert.doesNotMatch(js, /const skillContent/);
});

test('问小鲸不重复三段说明，职业与教育履历直接可读', () => {
  assert.doesNotMatch(html, /id="wxj-case-detail"|为什么做|我做了什么|如何验证/);
  assert.doesNotMatch(html, /data-case-toggle|data-career-toggle|class="career-panel" hidden/);
  assert.doesNotMatch(html, /研究可持续发展，也研究产品为什么不能持续被使用|新闻训练教我追问事实|一个训练表达，一个训练理解人/);
  assert.match(html, /从可持续发展到产品，做正确且有长期价值的事情/);
  assert.match(html, /<h3[^>]*>教育履历<\/h3>/);
  assert.doesNotMatch(html, /再认识一下/);
  assert.doesNotMatch(html, /白天研究可持续发展，做产品时研究用户为什么不能持续使用/);
});

test('履历先呈现教育再呈现职业经历，关于我直接抵达联系文案', () => {
  const careerStart = html.indexOf('<section id="career"');
  const skillsStart = html.indexOf('<section id="skills"');
  const aboutStart = html.indexOf('<section id="about"');
  assert.ok(careerStart >= 0 && skillsStart > careerStart && aboutStart > skillsStart);
  const resume = html.slice(careerStart, skillsStart);
  assert.match(resume, /<h2 id="career-title">履历<\/h2>/);
  const education = resume.indexOf('<div class="education-list"');
  const work = resume.indexOf('<div class="career-list"');
  assert.ok(education > 0 && work > education);
  assert.match(resume.slice(education, work), /香港城市大学[\s\S]*?澳门科技大学[\s\S]*?中南民族大学/);
  assert.match(resume.slice(work), /Datawhale[\s\S]*?香港智感传媒[\s\S]*?迅雷/);

  const about = html.slice(aboutStart, html.indexOf('</main>', aboutStart));
  assert.match(about, /<h2 id="about-title">如果你已经看到这里，<br>我们大概有不少可以聊的。<\/h2>/);
  assert.doesNotMatch(about, /教育履历|education-list|section-heading/);
  assert.match(html, /href="#about">关于我<\/a>/);
});

test('Datawhale 履历与项目卡展示相同的用户和完课率指标', () => {
  const datawhale = html.match(/<div id="career-datawhale" class="career-panel">([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.match(datawhale, /<div class="career-results">[\s\S]*?约 2\.2 万模块用户[\s\S]*?伴学用户完课率相对提升 10\.8%[\s\S]*?<\/div>/);
});

test('关键分区和真实外链存在', () => {
  for (const id of ['projects', 'career', 'skills', 'about']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  for (const url of [
    'https://1ivy403.github.io/rescue-xiaoan/demo/rescue-command-center/',
    'https://github.com/1ivy403/rescue-xiaoan/blob/main/README.md',
    'https://1ivy403.github.io/mochi/',
    'https://github.com/1ivy403/mochi',
    'mailto:sjulidezi@gmail.com',
  ]) {
    assert.ok(html.includes(url), `missing link: ${url}`);
  }
});

test('生活照和项目成果口径完整', () => {
  assert.match(html, /assets\/profile\/life-photo\.jpg/);
  assert.match(html, /<strong>2\.2 万<\/strong> 模块用户/);
  assert.match(html, /<strong>\+10\.8%<\/strong> 完课率/);
  assert.match(html, /决策效率提升 30%/);
  assert.match(html, /第 1 名<\/strong> \/ 100\+ 队伍/);
});

test('项目视觉使用指定素材，Mochi 直接展示封面而无切换入口', () => {
  for (const asset of [
    'assets/wenxiaojing/guided-learning-panel.jpg',
    'assets/wenxiaojing/course-page.jpg',
    'assets/rescue/live-photo.jpg',
    'assets/rescue/poster-user.png',
    'assets/mochi/poster.png',
  ]) {
    assert.ok(html.includes(asset), `missing project asset: ${asset}`);
  }
  assert.match(html, /class="mochi-preview"[\s\S]*?assets\/mochi\/poster\.png/);
  assert.doesNotMatch(html, /data-mochi-state|role="tablist"|role="tab"/);
  assert.doesNotMatch(js, /mochiStates|data-mochi-state/);
  assert.doesNotMatch(css, /\.segmented-control/);
  assert.match(html, /带我学习这一章/);
});

test('交互契约覆盖菜单和导航', () => {
  for (const marker of ['data-menu-toggle']) {
    assert.match(html + js, new RegExp(marker));
  }
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
