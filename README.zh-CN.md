# 嗨！图书馆

[English](README.md) | 简体中文

嗨！图书馆是一个由 AI 辅助创作、面向不同年龄和语言水平学习者的多语言分级阅读图书馆。

```text
works/<level>/<category>/<subcategory>/<title>/
```

不分级的多语言文学作品位于 `works/series/`：每种语言由对应 Writer 用母语独立创作 `article.md`，再由 `$scriptize-article` 生成整篇有声书脚本。分级绘本是 `works/<level>/...` 下的衍生物，只使用 `aa` 到 `n`；各语言共用无文字插画，正文采用 schema 3，绘本没有 audio script。

Codex 按 `AGENTS.md` 创作文章和已提交的插画 prompt。仓库代码绝不生成故事或 prompt；封面、页面插图和词卡只能由 `tools/imagegen` 根据已提交的 prompt 生成。

词汇位于 `vocabulary/<level>/<id>/`。故事正文直接标记目标词；每个词汇条目包含所有语言的本地化词语，以及一张共用的无文字词卡图片。

分级索引见 `prompts/levels/index.yaml`，每一级的独立标准见 `prompts/levels/<level>.yaml`，词汇数据集及来源见 `prompts/vocabulary/index.yaml`，各语言的词汇分级规则见 `prompts/vocabulary/ranges.yaml`，分片式运行时 JSON 设计见 `docs/catalog.md`。

## 内容质量

嗨！图书馆通过明确的源文件契约、同一作者自省和确定性校验保障质量：

- 源文件规则明确区分系列文学作品及有声书，与分级绘本的结构、问题、词汇和共用插画；
- 本地检查工具验证文件结构、跨语言页面对齐、作家、画风、词汇条目、资源文件和 Git LFS 状态；
- 六个内容 Skill 都先完成产出，再由同一作者按该步骤的具体清单自省，发现问题就修改并再次自省，直到没有问题；
- 文章研究使用权威来源，词汇创建实时核实单语词典、语言规范和课程证据；
- `$adapt-article` 生成并逐张查看图片，然后修复确定性检查器报告的错误。

这套流程不能保证机器辅助创作的内容绝对不会出错，但它让内容依据、失败条件和修正步骤变得明确且可重复。完整规则位于 `AGENTS.md` 和 `.agents/skills/`。

## Web 应用

静态阅读器位于 `apps/web`；仓库工具位于 `tools/`。构建期目录编译器位于 `tools/catalog`，作品检查器位于 `tools/check-work`。

```sh
pnpm install
pnpm dev
pnpm build
```

可部署的静态网站会输出到 `build/`。

检查一部完整作品及其引用资源：

```sh
npm run check-work -- works/a/fiction/animals/the-lost-kite
```

也可以直接调用仓库中已经安装的本地 CLI：

```sh
npx --no-install hailibrary-check-work works/a/fiction/animals/the-lost-kite
```

根据已提交的 prompt 为任一支持的目标生图；不传路径时扫描全仓待生成目标：

```sh
npx --no-install hailibrary-imagegen works/a/fiction/animals/the-lost-kite
npx --no-install hailibrary-imagegen vocabulary/a/jump
npx --no-install hailibrary-imagegen --dry-run
```

命令支持绘本插图、系列封面、词卡、Writer 头像和 Style 缩略图，并在各目标的 `imagegen-state.yaml` 中记录可续作进度。Style ID 变化会重建整个目标，只有 prompt 变化时需显式使用 `--force`。命令从环境变量或仓库根目录 `.env` 读取 `OPENAI_API_KEY`、可选的 `OPENAI_IMAGE_MODEL` 和 `OPENAI_BASE_URL`，环境变量优先。全部参数和退出码见 `--help`。

## 项目 Skills

Codex 可以自动发现 `.agents/skills/` 中的项目 Skills，也可以显式调用：

```text
$write-article
$scriptize-article
$adapt-article
$vocabulary
$writer
$style
```
