# 内容扩展架构（草案）

状态：Wave 01 执行中（50 部，见第 5 节）。本文只规划选题与基础设施，不替代 `AGENTS.md` 的创作与审核契约；每部作品仍按 `create-work` → `scriptize-article` → `review-fix-loop` 完成。

## 1. 现状盘点（2026-09-13）

- 44 部作品，全部为 `en-US` + `zh-CN` 双语，全部 `story.yaml` schema 2（已有 `article` + `audio_script`）。
- 全部作品 `status: draft`，且 checker 不校验 `status`。下游有声书项目目前无法区分“可发布”和“草稿”。
- 等级分布严重前倾：

| 段 | 等级 | 作品数 |
|---|---|---|
| emergent | aa / a / b / c | 0 / 7 / 7 / 6 |
| elementary_early | d / e / f / g / h / i / j | 6 / 4 / 2 / **0 / 0 / 0** / 2 |
| elementary_middle | k / l / m / n / o / p | 1 / 1 / 2 / 2 / 3 / **0** |
| elementary_upper | q / r / s / t / u / v | **全部 0** |
| secondary | w / x / y / z | **全部 0** |
| higher_education | z1 / z2 | 1 / **0** |

- 16 个等级空白：aa、g、h、i、p–z、z2。
- 42 虚构 / 2 非虚构，非虚构只在 o 级。
- 题材缺口：历史、传统文化与节日、人物传记、民间故事、诗歌韵文、艺术、运动、身体与健康、太空。`prompts/labels` 与 `prompts/taxonomy` 也没有对应标签。
- 已为 r–z 准备的 Writer（kind-spark / cora-mendwell / tomorrow-lens / inkstone-observer / 星火 / 明日镜 / 砚舟）尚无作品；meadow-lark、松果先生、银月 未使用。
- 所有作品都是独立单本，没有系列或复现角色。

## 2. 扩展原则

1. **先补空白，再加密度。** 每个等级至少 2 部（一虚构、一非虚构，emergent 段可两部虚构），再按有声书价值加量。
2. **虚构/非虚构配比随等级变化**：emergent 约 7:3，elementary 约 6:4，secondary 约 5:5，higher_education 约 4:6。
3. **双语并行仍是默认**：同一事件与学习目标，由各自 Writer 独立写作，不互译。
4. **文化根源双向**：中国题材（节气、端午、都江堰、活字印刷）与英语世界及全球题材（Mary Anning、黄石狼、Stone Soup）都用两种语言讲述。读者用目标语言讲自己的文化，也用母语了解别人的文化。
5. **系列化**：引入少量跨等级系列，复用角色与声线设定，提升有声书的连续收听和角色辨识度。
6. **质量优先于数量**：一部作品一个 PR，必须通过完整 review-fix-loop 才能进入 `ready`。宁可一波少做几部，也不降低审核标准。

## 3. 基础设施先行（Phase 0，产出内容前完成）

### 3.1 分类与标签

`prompts/taxonomy/index.yaml` 新增 subcategory（目录路径仍是唯一来源）：

| category | 新增 subcategory | 用途 |
|---|---|---|
| fiction | `folktale` | 公有领域民间故事与寓言的原创重述（Stone Soup、愚公移山） |
| fiction | `historical-fiction` | 真实历史背景中的虚构人物 |
| fiction | `verse` | 原创儿歌、韵文，两种语言各自押韵 |
| nonfiction | `history` | 历史事件与来源考辨 |
| nonfiction | `biography` | 真实人物，必须严格核查 |
| nonfiction | `culture` | 节日、习俗、节气、手艺 |
| nonfiction | `how-things-work` | 低龄说明文：身边的物、自然循环 |

`prompts/labels/index.yaml` 新增：

- topics：`history`、`culture`、`science`、`space`、`arts`、`sports`、`food`、`body-and-health`
- themes：`courage`、`curiosity`、`empathy`、`fairness`、`perseverance`、`identity`
- moods：`playful`、`calm`（`calm` 用于睡前与低刺激收听）

### 3.2 系列（schema 延后；Wave 01 先用清单里的角色设定保证连续性）

```text
series/<series-id>/series.yaml
```

- `series.yaml`：多语言系列名、角色设定（外观、性格、年龄随等级成长的规则）、每个 locale 的共享 `cast` TTS 抽象描述（delivery / timbre / pace / pitch，仍然不写供应商 voice ID）。
- `book.yaml` 新增可选 `series: {id, order}`。
- checker 校验：成员存在、`order` 不重复、作品内同 ID 角色的 `audio_script.cast` 与系列设定一致。
- catalog 输出 `series/<series-id>.json`。
- 系列可以跨等级，同一批角色随读者一起“长大”。跨等级时 Writer 可能不同，系列 bible 负责角色连续性，Writer 负责文字。

### 3.3 有声书就绪（下游项目依赖的内容侧契约）

- **脱图可听**：去掉插图后，`article` 仍必须能被理解。关键信息不能只存在于图中，也不写“看！”“这个”一类指向画面的空指代。把这一条写入 `review-work` 的失败条件，并用它补审现有 44 部作品，aa–c 为重点。
- **读音词表**：`audio_script` 新增可选 `pronunciations`，按 locale 记录人名、地名、多音字（如“行”“长”“藏”）、生僻专名的拼音或 IPA。checker 校验被引用的词出现在正文中。
- **块 ID 冻结**：作品进入 `published` 后，已有 block ID 不再重排或复用。修改文本时保留原 ID；新增块用新 ID。这样下游可以按 ID 缓存音频，并判断哪些片段需要重录。
- **章节即音轨**：`chapters` 即有声书分轨，章节标题必须适合朗读。
- **状态生命周期**：`draft` → `ready`（fresh review 全部 PASS）→ `published`（下游可消费）。checker 开始校验 `status` 枚举，catalog 默认只输出 `ready` 及以上作品，或至少在卡片上暴露状态。
- **下游读取入口**：建议有声书项目读取构建产物 `works/<work-id>/index.json` 与 `works/<work-id>/<locale>.json`（已含 `audio_script`、`chapters`），不直接解析源 YAML，从而把 schema 演进隔离在 catalog 编译器里。

## 4. 系列设计

| 系列 | 等级跨度 | 形式 | 核心 | 有声书价值 |
|---|---|---|---|---|
| **灯笼街 / Lantern Street** | g → k | 虚构·日常/悬疑 | 梅和开修理摊的爷爷，以及一条街的邻居；每本解决一个街区小问题 | 固定家庭声线，适合连续收听 |
| **野外笔记 / Field Notebook** | i → q | 叙事非虚构·自然科学 | 一对表姐弟跟着节气和季节观察真实现象 | 季播节奏，可随真实节气推送 |
| **月井晚安 / Moonwell Goodnight** | aa → b | 虚构·韵文/睡前 | 每晚一段原创韵文，同一只守井的小猫头鹰 | `calm` 睡前内容，时长短、复听率高 |

## 5. 选题清单：Wave 01（50 部）

完整清单、系列角色设定和每部的写作方向见 [content-wave-01.yaml](content-wave-01.yaml)。那份文件是 Codex 生成时读取的唯一选题来源。

| 段 | 等级（新增部数） | 新增 | 完成后每级至少 |
|---|---|---|---|
| emergent | aa(4) a(1) b(2) c(1) | 8 | 4 |
| elementary_early | d(2) e(2) f(2) g(2) h(2) i(2) j(1) | 13 | 2 |
| elementary_middle | k(1) l(1) m(1) n(1) p(2) | 6 | 2 |
| elementary_upper | q(2) r(2) s(2) t(2) u(2) v(2) | 12 | 2 |
| secondary | w(2) x(2) y(2) z(2) | 8 | 2 |
| higher_education | z1(1) z2(2) | 3 | 2 |

- 合计 50 部：虚构 26、非虚构 24。完成后共 94 部，aa–z2 每级至少 2 部。
- 新题材：民间故事 3（《乌鸦喝水》因 b 级 Writer 禁止改写寓言而撤下，换成原创《蚂蚁搬面包屑》）、韵文 3、历史 5、历史小说 2、人物传记 2、文化习俗 4、万物的道理 4。
- 系列：灯笼街 3 部（f→g→k）、野外笔记 3 部（i→n→q）、月井晚安 3 部（aa→aa→a）。
- 高阶长篇（w–z2）的页数取等级下限，控制插图数量。

## 5.1 生产方式

- 选题、质量标准、复核由 Claude 负责；正文、研究、词条、插图全部由 Codex（`gpt-5.6-sol`，reasoning `high`；最早 5 部由 `gpt-6-astra` low 生成）按 `AGENTS.md` 与 `$create-work` 生成。
- 调度：每部作品一个 Codex 会话，多部并行；同一系列按顺序串行，后一部读取前一部的文字和插图，保证连续性。
- 共享工作区隔离：每个会话只能写自己的作品目录和新建的词条目录，不能改已有词条、`prompts/`、`tools/`，也不能运行任何会改变 git 状态的命令。
- 复核：Codex 完成并通过 checker 后，由 Claude 独立复核文本（等级、母语自然度、脱图可听、事实与问题证据）；插图不复核。发现的问题交回原 Codex 会话修改，改完再复核，直到没有问题。
- 本波不提交 git，全部结果留在工作区等待人工确认。

## 6. 质量门槛（每部作品的完成定义）

1. `npx --no-install hailibrary-check-work <work>` 退出码 0。
2. 每个词条通过 `$review-vocabulary`；新卡片通过 `$create-vocabulary`。
3. 新作品通过 `$review-artwork`（本地有图像访问时须目视检查）。
4. `research.yaml` 覆盖所有可核查事实；fresh 审核独立联网复核，不只依赖 `research.yaml`。
5. 有声书附加项：脱图可听、读音词表完整、cast 声线可区分、章节标题可朗读、系列角色与 `series.yaml` 一致。
6. fresh full-work review 返回 `PASS` 后改为 `status: ready`，并在 PR 描述中写明审核摘要。

执行节奏：一部作品一个 PR。可以用多个 worktree 并行创作，但每部作品单独走审核循环，不合批放行。每完成一波，做一次语料层面的复盘：各等级分布、词汇复用、标题与主题是否重复、跨作品角色是否冲突。

## 7. 建议执行顺序

1. **Phase 0**：taxonomy/labels 扩展 → `status` 校验与生命周期 → 脱图可听审核规则 → `pronunciations` → `series` schema（checker + catalog + AGENTS.md 同步）。
2. **存量补审**：用脱图可听标准补审现有 44 部，通过的改为 `ready`，下游有声书项目可以先用这一批打通流程。
3. **Wave 1**（15 部）→ **Wave 2**（8 部）→ **Wave 3**（12 部）。Wave 3 篇幅短，可与 Wave 1 穿插进行，用来填补审核队列的空档。

## 8. 待确认的决定

- 是否引入 `series` schema（建议：是）。
- 波次优先级：先中段（有声书价值高、空白集中，建议）还是先低龄（量快、单部成本低）。
- 文化选题是否按第 2 节“双向”原则执行（建议：是）。
- 下游读取构建产物 JSON 还是源 YAML（建议：JSON）。
- Wave 2 的高阶长篇插图页数是否取等级下限，以控制美术成本。
