# Level and vocabulary contract

Use this reference to turn the repository's A-K data into a writing decision. The authoritative values remain in:

- `prompts/levels/levels.yaml` for structure, quantitative limits, inference, and questions;
- `prompts/vocabulary/ranges.yaml` for locale-specific lexical scope;
- `prompts/vocabulary/index.yaml` for concrete datasets, lookup order, evidence limits, and source metadata.

Always read the complete selected-level records in those files. If this summary differs from the YAML, follow the YAML and update this reference in the same change.

## A-K operational map

| Level | Band | Pages | Required reading work | English vocabulary direction | Chinese vocabulary direction |
| --- | --- | ---: | --- | --- | --- |
| A | emergent | 6-12 | Recognize familiar words; follow one visible action; repeated frame; no inference; picture question required. | Core spoken, very-high-frequency, concrete, readily decodable base words with picture and repetition. | 一年级上册起步；通常单字或透明双字词；至多一个易理解新字；实物、动作、颜色、方位。 |
| B | emergent | 8-14 | Follow goal-obstacle-resolution; connect one stated cause to a visible result; one obvious local inference; sequence required. | High-frequency everyday bases and common inflections; concrete action, object, quality, or relation. | 一年级范围；通常一至二字；每词一般不超过一个新字；家庭、学校、日常、感受和简单因果。 |
| C | early | 10-16 | Integrate two linked events; explain a simple cause; give a brief constructed answer; cause-effect and short answer required. | High-frequency plus a small recoverable fringe; common compounds, derivations, and simple relations. | 第一学段中段；一至三字；一个新字为常态，两个须有强支持；描述、顺序、因果、对比和熟悉自然过程。 |
| D | early | 12-20 | Track motivation and consequences across scenes; make several local inferences; cause-effect and motive required. | Mixed everyday frequency; productive morphology, common phrasal forms, emotion, time, and cause recoverable without pictures. | 第一学段完成；常见二至三字词；动机、后果、情绪、程度、分类及基础技术文化词；正文必须给出线索。 |
| E | transitional | 14-24 | Connect evidence across chapters; follow a changed plan or viewpoint; identify the central idea; motive and main idea required. | Mixed-frequency general vocabulary; common word families, transparent figurative use, one abstract relation refined across pages. | 第二学段起步；通常二至四字；观点、证据、变化、比较、类别和简单抽象；至少两次使用或一次明确解释。 |
| F | transitional | 16-28 | Sustain a multi-step reasoning chain; compare plausible choices and tradeoffs; evidence and comparison required. | General academic plus supported domain vocabulary; comparison, constraint, evidence, and tradeoff reused across chapters. | 第二学段中段；可用一般学术及领域词；限制、方法、过程、证据、权衡及认识变化；跨章节复现。 |
| G | independent | 18-32 | Read independently; reconcile defensible competing goals; connect separated evidence; evaluate; prose carries the full causal chain. | Meaningful low-frequency, domain, and multiword terms supported by discourse rather than pictures. | 第二学段完成；精准学术、情绪和领域词；多重限制、证据、系统关系及评价；主要依靠跨场景语境。 |
| H | independent | 20-36 | Synthesize implicit motives; evaluate a consequential choice between legitimate values; trace long-range effects; evaluation and synthesis required. | Nuanced evaluative, ethical, technical, near-synonym, and controlled idiomatic vocabulary. | 第三学段起步；评价、伦理、比喻及技术词；价值冲突、同意、责任、不确定性和长远后果；避免成语堆砌。 |
| I | analytical | 22-40 | Test competing explanations; separate observation, interpretation, and assumption; revise a model from evidence; source analysis required. | Abstract and domain-specific polysemy, nominalization, model, and uncertainty whose meaning may change with evidence. | 第三学段中段；抽象和领域词及受控多义；观察、解释、假设、模型、来源可靠性、概率和歧义。 |
| J | analytical | 24-44 | Integrate narrative, research context, source perspective, counterexample, and uncertainty into a synthesis; source and research responses required. | Disciplinary, rhetorical, register-sensitive, polysemous vocabulary for qualification, counterexample, and synthesis. | 第三学段完成；学科、修辞和来源意识词汇；限定、反例、视角、机制、综合和局限；不能把识字等同于会词。 |
| K | advanced | 28-56 | Evaluate interacting systems, models, rhetoric, contested values, uncertainty, and second-order consequences; open response and transfer required. | Sophisticated academic and indispensable specialist vocabulary with dense morphology, register, and connotation. | 小学毕业衔接；以小学常用字承载复杂概念，受控引入必要专业词；系统、模型、修辞、争议价值、不确定性及二阶影响。 |

The page range is only an orientation. Copy the exact locale-specific sentence, per-page, total-unit, and new-word ceilings from `levels.yaml` into the working brief before writing.

## Locale-specific vocabulary decisions

### English

1. Check Cambridge Young Learners when a beginner-source alignment is relevant.
2. Check the local NGSL rank and familiarity band for frequency evidence.
3. Check English Vocabulary Profile or an authoritative domain source for the intended sense, phrase, and register.
4. Apply the selected qualitative range. Record the HaiLibrary level separately from every external source level.
5. Do not assign I-K from raw frequency: advanced difficulty depends on meaning, abstraction, register, rhetoric, morphology, and knowledge demand.

### Chinese

1. Check every character against the TGHZ common-character inventory.
2. Check the complete word, not merely its component characters, against an exact textbook edition or named corpus.
3. Distinguish `recognition`, `writing`, `word-list`, `in-text`, and `curriculum-stage` evidence.
4. Record edition, publisher, grade, semester, scope, appendix or page location, source, and verification date for textbook evidence.
5. Judge word formation, semantic load, orthographic load, pronunciation, and context support together. Character count alone does not set the level.

For every locale, definitions must be easier than the term. Proper names, cultural terms, and indispensable domain terms may exceed the usual range only when the context makes them recoverable and the working brief records the exception.

## Required pre-draft brief

Create this temporary working brief for every locale before drafting. It guides creation and review; it does not add redundant level fields to source YAML.

```text
Work path:
Level and band:
Locale:

Mechanical limits:
- pages:
- total units:
- mean and maximum sentence units:
- typical and maximum units per page:
- sentences per page maximum:
- new words per page maximum:

Complexity contract:
- reading goal:
- plot and complexity floor:
- cohesion and predictability:
- knowledge demand:
- illustration reliance:
- inference and evidence span:
- allowed and required question types:

Vocabulary contract:
- running-text baseline:
- target-word familiarity, form, and meaning range:
- context-support methods:
- datasets and curriculum evidence consulted:
- terms requiring live dictionary or domain verification:
- justified exceptions:

Locale plan:
- natural sentence and discourse patterns:
- information order and rhythm:
- places where this locale must diverge from another locale's wording:
```

## Draft and review gates

- Reject a draft that stays below the level's complexity floor even if its page or word count fits.
- Reject a draft that exceeds any mechanical ceiling, accumulates unsupported unfamiliar running text, or depends on pictures beyond the permitted illustration role.
- Reject mechanically translated wording. Shared page meaning, speakers, evidence, and learning goals must align; native realization may and should differ.
- Confirm required question types, answerability from `page_refs`, and evidence span after the prose is stable.
- Recalculate the quantitative evidence and re-run native-language, vocabulary, and full-work review after material revisions.
