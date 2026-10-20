---
title: "Hexo+Next博客优化"
pubDate: 2023-01-01
type: note
draft: true
tags: []
description: ""
---

# 一、技术定制：让博客体现你的前端/工程化能力

基于next现成主题框架做二次开发和优化。

## 1. 主题深度定制（替代默认样式）

### 操作步骤：

- 基础配置：修改 Next 主题配置文件 `_config.next.yml`，自定义配色、字体、布局（比如单栏改双栏）、关闭冗余组件（如不常用的社交图标）。

- 自定义样式：在 `source/css/_custom/custom.styl`（Next 主题专属）中添加自定义 CSS，比如：

    - 实现**阅读进度条**（跟随滚动位置变化）；

    - 优化代码块样式（添加一键复制按钮、自定义高亮配色）；

    - 适配暗黑模式（调整文字/背景对比度，优化图片显示）。

- 新增实用组件：比如添加「文章最后更新时间」「阅读时长估算」「自定义 404 页面」。

### 简历体现：

基于 Hexo+Next 主题完成前端定制开发，新增阅读进度条、代码块复制等 8+ 交互组件，自定义暗黑模式与响应式布局，优化博客 UI/UX 体验。

## 2. 集成高价值功能模块

选以下易实现且有亮点的功能，解决“纯笔记博客”的交互短板：

|功能|实现方式|简历体现点|
|---|---|---|
|全文搜索|开启 Next 主题的 `local_search`，或集成 Algolia 搜索（更精准）|解决笔记检索难题，提升内容可达性|
|评论系统|集成 Giscus（基于 GitHub Discussions，无需服务器，零成本）|实现读者互动，完善博客社区属性|
|RSS 订阅|安装 `hexo-generator-feed` 插件，生成 RSS 文件并配置到博客首页|支持内容订阅，提升内容分发能力|
|图片懒加载|安装 `hexo-lazyload-image` 插件，减少首屏加载资源|优化页面加载性能|
## 3. 性能与 SEO 优化

让博客不仅“能用”，还能“好用、易被发现”：

- 图片优化：用 `hexo-imageoptim` 插件自动压缩图片，或手动用 TinyPNG 压缩；

- CDN 加速：将图片、JS/CSS 静态资源托管到 JsDelivr/Cloudflare 免费 CDN；

- SEO 配置：
        

    - 安装 `hexo-generator-sitemap` 生成站点地图，提交到百度/Google 搜索控制台；

    - 给每篇文章添加 `keywords`（关键词）、`description`（描述），让文章能被搜索引擎收录。

### 简历体现：

通过图片压缩、CDN 加速等手段将博客页面加载速度提升 40%；完成 SEO 基础配置，实现技术文章搜索引擎收录率 80%+。

# 二、工程化实践：体现 DevOps/自动化能力

这部分能体现你懂“规范化、自动化”，是区别于普通博客的关键：

## 1. 自动化部署（核心亮点）

替代手动执行 `hexo clean && hexo g && hexo d` 的繁琐流程，用 GitHub Actions 实现“提交代码自动部署”：

### 操作步骤：

1. 在博客的 GitHub 仓库中新建 `.github/workflows/hexo-deploy.yml` 文件；

2. 复制以下配置（直接可用）：

```yaml
name: Hexo Deploy

on:
  push:
    branches:
      - main  # 你的源码分支（比如 master）

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v4
        with:
          submodules: true
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'  # 适配 Hexo 的 Node 版本

      - name: Install dependencies
        run: npm install

      - name: Build Hexo
        run: npm run build  # 对应 package.json 中的 "build": "hexo generate"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
          publish_branch: gh-pages  # GitHub Pages 部署分支
```

1. 提交该文件后，后续只需把笔记推送到 `main` 分支，GitHub 会自动构建并部署到博客。

### 简历体现：

基于 GitHub Actions 搭建自动化部署流程，替代手动部署操作，将博客发布周期从 10 分钟缩短至 1 分钟，迭代效率提升 90%。

## 2. 规范化管理项目仓库

完善 GitHub 仓库的“门面”，体现你的工程化思维：

- 编写清晰的 `README.md`：包含「项目介绍（技术栈）」「部署步骤」「功能亮点」「博客预览截图」；

- 添加 `LICENSE` 文件（比如 MIT 协议），体现开源规范意识；

- 对自定义的配置/代码添加注释，便于后续维护。

## 3. 只推送笔记（核心操作，适配简历规范化亮点）

核心逻辑：Hexo笔记默认存储在 `source/_posts` 目录（所有Markdown格式笔记均在此处），只需精准提交该目录文件，不推送主题配置、插件、生成文件等无关内容，既保持仓库整洁，也能正常触发自动化部署，同时体现你的规范化操作意识。

### 操作步骤（分2种场景，按需选择）

#### 场景1：手动推送（适合偶尔更新笔记）

1. 确认笔记已保存至 `source/_posts` 目录（单篇笔记为.md文件，可按技术分类创建子目录，如 `source/_posts/前端笔记`）；

2. 执行git命令，仅提交笔记目录（不提交其他文件），终端输入以下命令（依次执行）：
`# 仅添加笔记目录（精准推送，不涉及主题、配置等文件）
git add source/_posts/
# 提交备注（规范备注，体现工程化意识，如“更新笔记：JavaScript核心知识点”）
git commit -m "更新笔记：XXX（笔记标题/分类）"
# 推送至GitHub源码分支（与你自动化部署配置的分支一致，如main）
` `git push origin main`

3. 推送完成后，GitHub Actions会自动检测main分支变动，仅根据新增/修改的笔记重新构建博客，无需手动执行部署命令。

#### 场景2：结合软链接同步（适合用Obsidian等工具记笔记，自动同步）

若日常用Obsidian等笔记工具记录，无需手动复制笔记到Hexo目录，可通过软链接自动同步，再推送笔记，操作更高效：

1. Windows系统（以管理员身份打开命令提示符），输入命令创建软链接（将Obsidian笔记目录链接到Hexo的_posts目录）：
                  `# 格式：mklink /D "Hexo的_posts目录路径" "Obsidian笔记目录路径"
` `mklink /D "D:\Blog\source\_posts" "C:\Obsidian\技术笔记"`

2. Mac/Linux系统，终端输入命令创建软链接：
                  `# 格式：ln -s Obsidian笔记目录路径 Hexo的_posts目录路径
` `ln -s ~/Obsidian/技术笔记 ~/Blog/source/_posts`

3. 软链接创建后，修改Obsidian笔记会自动同步到Hexo的_posts目录，后续只需执行场景1的git命令，即可只推送同步后的笔记。

### 关键注意事项（避坑重点）

- 配置 `.gitignore` 文件（根目录下），过滤无关文件，避免误推送，可添加以下内容（补充完善）：
                  `# 过滤Hexo生成文件
/public/
/node_modules/
# 过滤主题配置备份（若有）
/_config.next.yml.bak
# 过滤系统临时文件
.DS_Store
` `Thumbs.db`

- 推送前确认未执行 `git add .`（该命令会添加所有变动文件），仅用 `git add source/_posts/` 精准添加笔记；

- 若需修改主题、配置，可单独提交该类文件，与笔记推送分开，保持提交记录清晰（体现规范化管理，适配简历亮点）。

### 简历体现（补充适配）

规范博客仓库提交流程，实现精准推送笔记功能，通过软链接同步、.gitignore过滤等操作，保持仓库整洁，提升笔记更新与部署效率，体现工程化规范意识。

# 三、内容打磨：体现知识沉淀能力

技术再炫，没有有价值的内容，项目也会显得空洞。重点是让内容“体系化、有价值”：

1. **内容分类体系化**：
        

    - 按技术栈划分目录（比如「前端基础」「算法刷题」「Hexo 实战」）；

    - 打造系列文章（比如「JavaScript 核心知识点系列」「LeetCode 刷题笔记系列」），每系列至少 3 篇，体现知识的连贯性。

2. **内容质量提升**：
        

    - 每篇文章添加「可运行的代码示例」「逻辑流程图（用 Mermaid 绘制）」「踩坑记录/解决方案」；

    - 统一文章格式（标题、目录、正文、参考文献、更新时间），提升可读性。

### 简历体现：

沉淀 20+ 篇技术文章，涵盖前端/算法领域，打造 3 个系列化知识专栏，体现对技术知识点的深度理解与总结输出能力。

# 四、简历包装：把亮点转化为HR能看懂的语言

核心是**量化成果、匹配岗位、突出价值**，以下是可直接复用的项目描述模板：

## 简历项目描述示例

```text
项目名称：个人技术博客（Hexo + Next + GitHub Pages）
技术栈：Hexo、Next、HTML/CSS/JS、GitHub Actions、CDN、SEO、Giscus
核心成果：
1. 定制开发：基于 Next 主题完成前端定制，新增阅读进度条、代码块复制等 8+ 交互组件，优化暗黑模式与响应式布局；
2. 自动化部署：搭建 GitHub Actions 自动化流程，将博客部署效率提升 90%，实现代码提交后自动发布；
3. 性能优化：通过图片压缩、CDN 加速将页面加载速度提升 40%，完成 SEO 配置使文章收录率达 80%+；
4. 内容沉淀：发布 20+ 篇技术文章（含 3 个系列专栏），覆盖前端/算法领域，博客累计访问量 5000+。
```

## 关键技巧：

- 量化成果：用数字说话（访问量、优化百分比、文章数量），避免“提升了体验”这类空泛描述；

- 匹配岗位：应聘前端岗重点提“主题定制、性能优化”，应聘全栈/运维岗重点提“自动化部署、CDN 配置”；

- 突出问题：比如“解决手动部署繁琐问题”“解决默认主题搜索功能缺失问题”。

# 总结

1. **技术层面**：主题定制、自动化部署、性能优化是核心亮点，体现你的前端/工程化能力；

2. **内容层面**：体系化的技术文章体现知识沉淀和总结输出能力，让项目有实际价值；

3. **简历包装**：量化成果、匹配岗位需求，把技术动作转化为可衡量的价值，让HR快速感知你的能力。

按这个思路优化后，你的博客项目不再是“简单的笔记发布”，而是能体现多维度能力的优质项目，完全可以成为简历中的加分项。
> （注：文档部分内容可能由 AI 生成）