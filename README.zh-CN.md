# 嗨！图书馆

[English](README.md) | 简体中文

嗨！图书馆是一个由 AI 辅助创作、面向不同年龄和语言水平学习者的多语言分级阅读图书馆。

```text
works/<level>/<category>/<subcategory>/<title>/
```

图书源文件使用 YAML 编写。每种语言版本都必须符合目录所声明的等级，共用同一组无文字页面插画，并标明每句内容的说话者，以便未来生成 TTS 音频。Codex 按照 `AGENTS.md` 创作和审核内容；仓库代码本身不会调用模型生成故事或插画。

词汇位于 `vocabulary/<level>/<id>/`。故事正文直接标记目标词；每个词汇条目包含所有语言的本地化词语，以及一张共用的无文字词卡图片。

分级标准见 `prompts/levels/levels.yaml`，词汇数据集及来源见 `prompts/vocabulary/index.yaml`，各语言的词汇分级规则见 `prompts/vocabulary/ranges.yaml`，分片式运行时 JSON 设计见 `docs/catalog.md`。

## 内容质量保障体系

嗨！图书馆使用分层审核体系，不依赖单次生成或单个 Agent 的判断：

- 源文件规则约束每部作品的等级、结构、语言版本、说话者、问题、词汇和共用插画；
- 本地检查工具验证文件结构、跨语言页面对齐、作家、画风、词汇条目、资源文件和 Git LFS 状态；
- 母语审校分别独立阅读每种语言；用法存疑时，在线查阅单语词典、语言规范、语料库以及文体相近的母语作品；
- 整书审核检查等级适配、叙事连贯性、题目证据、词汇和插画，并通过权威网页独立核查现实世界中的事实和常识；
- 修复任何问题后，都要重新执行完整的确定性检查和编辑审核。只有检查工具通过，并且新一轮审核没有发现问题，作品才可以视为就绪。

这套流程不能保证机器辅助创作的内容绝对不会出错，但它让审核证据、失败条件以及需要人工介入的情况变得明确且可重复。完整规则位于 `AGENTS.md` 和 `.agents/skills/`。

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

## 项目 Skills

Codex 可以自动发现 `.agents/skills/` 中的项目 Skills，也可以显式调用：

```text
$create-work
$review-native-language
$review-work
$create-vocabulary
$review-vocabulary
$create-writer
$review-writer
$create-style
$review-style
$review-artwork
```
