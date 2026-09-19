# Adaptive Contextual Sidebar — Frozen Product & Technical Design v0.1

**中文名称：自适应上下文侧栏**  
**设计包：ACS-v0.1**  
**版本：0.1.0 · 冻结日期：2026-09-19**  
**状态：DESIGN_FROZEN / IMPLEMENTATION_NOT_STARTED / LIVE_CAPABILITIES_UNVERIFIED**

> 当前聊天决定注意力中心；用户行为决定实际关联；显式纠错决定最终边界。系统不要求用户维护工作区，也不取得聊天数据的所有权。

## 文档效力与证据边界

本文件以用户提供的 939 行需求附件为需求基线，覆盖其要求的 40 个交付项。它冻结产品语义、技术边界、数据契约、初始策略、实施顺序与停止条件，不代表产品所有者已经授权实施。本轮没有修改任何现有项目、仓库、浏览器或真实聊天数据。

本文件严格区分三类内容：带 `[Sxx]` 的平台事实来自本次查阅的公开一手资料；其余标为“冻结”的行为是本设计作出的规范性选择；性能、准确率、体验指标均是待测试的门槛，不是已测结果。本文没有检查用户当前登录页面的真实 DOM，没有运行 capability spike，没有测出语义模型在用户数据上的效果。

“冻结”不等于假装未知风险已被解决。R0 可以依据真实证据填写 selector、已支持路由与能力矩阵，但不得改变本文件的产品边界。某条必需能力不能通过门槛时，执行结果必须是 NO-GO 或明确受限的试验版本，不得偷偷依赖私有接口或改做右侧面板。

冲突优先级：安全与来源真实性 ＞ 用户显式决定 ＞ 原生功能完整性 ＞ 可预测性 ＞ 关联召回 ＞ 紧凑程度 ＞ AI 使用率。各章节中的 MUST／不得为约束；数值均属于版本化初始策略，不是心理学定律。调整策略须记录版本、原因和回归结果。

---

## 01. Executive decision｜执行结论

**选择 D：以 B 的 anchor-centric relation graph 为核心，加上每个 Tab 独立的稳定显示状态；不建立用户可见 Workspace，也不做持久化 latent cluster。**

产品载体选择 ChatGPT Web 上的 Chrome Manifest V3 扩展。修改范围仅限经验证可安全隔离的普通 conversation-list 区域。主界面不是 Chrome Side Panel，不是独立 Web App，不是 Project 上层。

V0.1 需要同时交付行为基线与可关闭的正式 GPT 语义通路。AI 不是每次导航的依赖，也不是“未来再说”的空接口；它必须在末期试验中证明增益。行为基线先完成，用于证明智能功能是否值得承担额外成本。

四项关键修正如下。

| 原始直觉 | 冻结后的精确定义 |
|---|---|
| 打开新 Chat 就切换整个侧栏 | anchor 立即更新，但集合成员和顺序不必重建；在当前集合内部切换，优先保留位置 |
| Others 包含其余全部聊天 | Others 恢复原生聊天浏览入口，允许原生列表包含当前集合；不宣称扩展掌握全部历史 |
| 只过滤现有 DOM 行就足够 | 过滤无法显示未渲染的候选；主方案是在原生普通列表槽位显示小型投影，并保留原列表可逆恢复 |
| 安装扩展后可直接自动调用 GPT | 本地行为模式可直接使用；云端语义必须另行知情启用，并解决正式 API 凭证保管 |

**商业／公开发布结论：尚不能给 GO。设计结论：值得先做 R0；只有 R0 通过，才值得继续建设。**

## 02. Product definition｜产品定义

ACS 是普通聊天侧栏的动态注意力视图：根据当前打开的 Chat、近期可观察活动、直接聊天关系及用户纠错，呈现一个小而稳定的当前 Working Set。

它回答的是“此刻哪些线程值得与当前 Chat 一起露出”，不是“这个 Chat 永久属于什么类别”。同一个 Chat 可以在许多 anchor 的局部邻域中出现；两个 anchor 也可以共用同一组可见聊天，但这不意味着创建了一个 Workspace。

`Working Set` 是一次有状态的导航投影。`Conversation` 仍由 ChatGPT 管理。关系元数据不是 ChatGPT 的上下文注入机制：把 A、B 放在一起，不会让 ChatGPT 自动读取另一聊天的正文，也不会改变模型可访问的上下文。

核心假设：在持续使用后，用户寻找和切换“当前相关线程”的成本，明显低于原生历史列表；小列表不是通过阻碍其他聊天来人为提高使用占比。

## 03. Core user experience｜核心体验

首次启用时显示一次简短说明：只调整普通聊天列表，不移动聊天；`Others` 可恢复原生浏览；默认不向外发送正文。没有 Workspace 命名向导，也没有导入全历史流程。

打开 ANS-04 后，可见 ANS-04、ANS-03 closure、无人开发监管等少数线程。点击其中已有的“无人开发监管”，只更新当前选中状态，尽量不挪动其他行。随后通过搜索打开论文审计，才在导航确定后恢复论文对应的邻域。

点击到新 Chat 的同步路径只有身份解析、本地安全检查、缓存／本地规则和绘制。请求模型、读取远程历史、等待网络都不在该路径上。冷缓存时先保留原生列表或给出明确有依据的小集合；不展示“正在等待 AI”的阻塞侧栏。

正常使用不需要日常整理。纠错仅有两个核心动作：“总与当前聊天一起显示”和“不与当前聊天一起显示”，以及撤销／恢复自动。用户可以在原生浏览中选择需要补入的聊天。

## 04. Explicit non-goals｜明确非目标

V0.1 不提供 Workspace 创建／切换／命名、嵌套文件夹、标签、全历史分类、全量语义索引、知识库、任务管理、生产力看板、云同步、协作、移动端、托管账号系统、跨平台聊天搬运或 PAIA 主线改造。

不自动发送 ChatGPT 消息，不调用未公开的 ChatGPT 后端，不修改 Project 归属，不接管删除、归档、重命名、分享等原生数据操作。不开发一个“顺便更好的完整 ChatGPT UI”。

不承诺发现从未观察到、从未打开、也不在当前渲染列表中的任意历史 Chat。用户通过原生入口打开它以后，它才进入本产品可观察范围。

## 05. Product carrier decision｜载体决策

公开文档描述的 OpenAI 插件 UI 是随工具结果提供的 iframe，通过 MCP Apps bridge 与宿主通信；文档列出的内联、全屏等能力并不是全局普通聊天导航监听或原生侧栏控制契约。此次未找到能够满足本产品四项核心要求的官方 Plugin／Apps SDK 接口，因此不把它作为核心载体。[S01]

Chrome content script 可以读取、调整所注入页面的 DOM，并运行在隔离执行环境；导航 API 提供历史状态变化事件与 tab／document 标识。这为“浏览器增强”提供了正式基础，但不保证 ChatGPT 的 DOM 长期稳定。[S02][S03]

冻结支持面：桌面 Chrome 稳定版及上一稳定版、ChatGPT Web、普通登录聊天；首个完整试验环境为 macOS。扩展行为层不人为绑定操作系统；正式语义 helper 的其他系统分发留待另行验证。未通过测试的浏览器、窄屏布局、路由和页面变体均不宣称支持。

核心权限仅为 ChatGPT 指定域的内容脚本访问、`storage`、`webNavigation`；本地语义助手使用独立申请的 `nativeMessaging` 权限。只有实际实现确需特权式注入／紧急清理时才增加 `scripting`。不申请 `cookies`、`webRequest`、`history`、`debugger`、`<all_urls>` 或整机文件访问权限。不读取全浏览器历史来代替真实使用观测。

## 06. Workspace vs dynamic context｜模型选择

| 模型 | 优点 | 对本需求的主要问题 | 决策 |
|---|---|---|---|
| A. explicit Workspace | 归属明确，便于手工恢复 | 要求创建、命名、切换和维护；违背 chat-first | 拒绝 |
| B. anchor-centric graph | 支持多重相关性，不要求分类 | 单独使用会在 hub 聊天处跳变，容易产生邻域漂移 | 核心 |
| C. latent dynamic clusters | 能形成隐式群组 | 聚类分裂／合并难解释，容易重新变成分类器 | 延期 |
| D. graph + per-tab view continuity | 保留直接关系，同时维持操作连续性 | 必须清楚限制继承、缓存和失效 | 采用 |

不创建 `Workspace`、`WorkspaceMembership`、`PreferredWorkspace`、`WorkspaceSwitcher`。内部 `ViewSnapshot` 和 `ContextLease` 只表示当前呈现与短期继承，不是隐形的永久工作区。

同一个“无人开发监管”Chat，可能从 ANS 任务中打开，也可能从 SEM 任务中打开。直接邻域提供相关候选；Tab 内前序显示状态提供访问语境。不得把某一次 Tab 的 ANS 显示集合写成该监管 Chat 唯一的全局归属。

## 07. Interaction model｜交互模型

正常状态下，只有原生普通列表槽位内的小列表与其末尾的 `Others`。当前选中 Chat 沿用选中态，不强制跳到第一行。存续条目保留相对顺序，新晋条目原则上追加；不按每一次分数变化重新排序。

| 操作 | 立即效果 | 后续效果 |
|---|---|---|
| 点击当前可见成员 | 更新 anchor／选中态，保留连续性 | 当前 Tab 下一安全时机重估必要差异 |
| 从 Search／URL／历史打开其他 Chat | 等待实际路由确认后恢复本地邻域 | 异步补充证据，不阻塞导航 |
| 展开 Others | 恢复原生列表，暂停自动收折 | 选择成功打开的 Chat 后返回上下文模式 |
| 保留 B 与 A | 写入 A→B 显式 include，立即生效 | 跨重启保持，不被 AI 覆盖 |
| 排除 B 与 A | 写入 A→B 显式 exclude，立即生效 | 下一次打开 A 不得自动加回 B |
| 恢复自动 | 取消该方向的显式规则 | 重新使用行为和语义 |
| 恢复原始侧栏 | 当前 Tab 进入原生模式 | 不删除关系与纠错记录 |

不添加全局 Pin 功能，以免扩张为收藏管理器。原生 Pin 的显示、操作和归属不由扩展改写。原生已有固定区域保持不动；如果固定行位于普通列表可控区域，其可见性按保护项处理。对这种原生保护入口，不提供会误导用户的 ACS“排除后隐藏原生固定项”承诺；需要取消原生固定时走原生操作。ACS 的人工排除只控制自己的可控投影，不控制受保护的原生入口。

## 08. Information architecture｜信息架构

用户可见层只有：上下文列表、Others／返回当前列表、两项纠错、原始侧栏恢复。扩展弹窗包含启停、AI 模式、数据清除／导出与诊断入口；不建立独立导航产品。

内部对象冻结如下。

| 对象 | 职责 | 不承担的职责 |
|---|---|---|
| `ConversationRef` | 有来源证据的身份、标题、可导航 URL | 不保存完整对话 |
| `ScopeBinding` | 区分账号／原生 workspace 可见边界 | 不是产品 Workspace |
| `ActivityEvent` | 已发生的可观察活动 | 不代表用户意图真值 |
| `PairEvidence` | 两个 Chat 的直接语义／行为关系 | 不进行传递性归类 |
| `ManualRule` | 定向 include／exclude | 不转为模型标签后丢弃原决定 |
| `EvidencePacket` | 有界的已发送 user input 证据 | 不等于完整聊天摘要 |
| `BaseNeighborhoodCache` | anchor 的共享、本地、确定性基线 | 不保存某 Tab 的临时继承成员 |
| `TabViewState` | 当前 Tab 的顺序、anchor、lease、模式 | 不驱动其他 Tab 的即时 UI |
| `CapabilityReport` | 可证实的 adapter 能力与限制 | 不用“一个 selector 命中”代替证明 |

## 09. Conversation identity architecture｜身份架构

逻辑键为 `ScopeKey + Provider + DurableConversationId`。不能用标题、列表位置、相似内容或新聊天的临时本地编号作为永久身份。重复标题不得合并；标题更改不创建新 Chat。

优先依据地址栏中的已验证公开 conversation URL，与页面渲染的链接、选中态等来源交叉校验。`/c/<id>` 只能作为待验证的路径示例，不作为所有聊天的官方长期契约；Project／GPT 相关路径逐种记录真实观察到的形态。保留实际观察到的导航 URL，不擅自拼出另一种路径。

`ConversationRef` 必需字段：scopeKey、provider、conversationId、observedUrls、title及其observedAt、identityEvidence、routeKind、projectStatus、lifecycleStatus、lastQualifiedActivityAt、lastEvidenceAt、revision。未观察到的创建时间、最后消息时间、Project 归属必须是 unknown。

**账号隔离是硬门槛。** `ScopeBinding` 仅在适配器能从公开渲染信息获得足够唯一、经测试的账号／原生 workspace 边界时标记 VERIFIED。显示名或头像颜色不能单独作为可靠主键；原生 workspace 与本产品拒绝的 Workspace 对象不是一回事。

无法验证 scope 时，不得把此前缓存的标题、摘录或未渲染链接投放到当前页面；停用跨文档持久邻域复用，恢复原生列表。私人 spike 可在明确单账号测试环境中进行，但不能把这个前提伪装成生产级多账号隔离。若目标页面没有可安全验证的 scope 信号，跨账号缓存安全这一 gate 不通过。

退出登录、账号／原生 workspace 切换、scope 矛盾都会先关闭投影并隔离旧数据，再建立新 scope。新建、分享页、临时聊天、无访问权限、未知路由分别建状态，不把它们强行解析成普通持久 Chat。

## 10. SPA / navigation lifecycle｜导航生命周期

以顶层 `webNavigation.onCommitted` 和 `onHistoryStateUpdated` 为主信号；内容脚本的初始化、`pageshow`、`popstate`、页面重新获得可见性，以及有界 DOM 观测用于校验和补偿。官方文档明确：History API 导航有对应事件；从 Back/Forward Cache 恢复不一定触发 DOMContentLoaded。[S03]

不修改 ChatGPT 的 `history` 方法，不注入主执行世界获取 React 状态。点击事件只是导航意向，不能在点击时就认定目标已经成为 anchor。

冻结顺序：观察路由 → 增加 navigationEpoch → 停止旧正文证据采集 → 解析身份与 scope → 进行本地呈现安全检查 → 读取缓存／本地基线 → 原子提交当前 Tab 视图 → 等待正文归属验证 → 异步更新活动与语义。

**URL 变了不意味着正文已换完。** 旧正文仍在屏幕上时，不得把它登记到新 Chat。正文归属需要 R0 实证过的 route-to-content barrier；纯等待 300 毫秒、标题变化或 MutationObserver 回调次数均不能单独证明归属。证明不足时，导航功能可运行，但正文证据采集关闭。

| 场景 | 必须处理的差异 |
|---|---|
| 普通点击／Search／Others | 记录来源；等待确认导航；失败时保持可恢复原视图 |
| 直接 URL／外部链接 | 没有前序点击也能完成初始化 |
| Back／Forward／BFCache | 恢复当前实际路由；丢弃旧 epoch 的 UI 请求 |
| SPA pushState／replaceState | 同一 documentId 下也可能有不同 navigationEpoch |
| Tab duplication | 新 tabId／运行实例；可复制安全基线，不共享当前可变视图 |
| 多 Tab 同时使用 | 全局可积累行为证据，但 anchor 与可见集合不互相覆盖 |
| Project conversation | 可识别并充当 anchor，Project 原生树不改变 |
| 新 Chat 获得持久 URL | 原子迁移临时状态；禁止依据标题合并 |
| 路由／正文不一致 | 保留或恢复原生 UI；暂停采集，记录能力失败 |

## 11. Per-tab state｜每个标签页独立状态

实例标识使用 browserSessionId、tabId、documentId 和内容脚本 instanceNonce；在其下维护 navigationEpoch、scopeKey、anchorKey、mode、visibleOrder、baseCacheRevision、manualRevisionObserved、viewRevision、pendingRefresh、inheritedLease、sidebarInteractionState。

每个异步 UI 提交必须同时匹配当前 tabId、documentId、instanceNonce、navigationEpoch、scopeKey、anchorKey、请求对应证据版本和当前 manual revision。任何一个不匹配都不得绘制。

合法但过时的语义结果可以写入“仍完全匹配原证据 hash”的关系缓存，不得更新已经切换 anchor 的界面。涉及撤回授权、清除数据或失效 scope 的结果连缓存也不得写入。

共享学习结果只标记相关基线缓存 dirty；不得直接广播“把所有 Tab 的列表改成这个集合”。其他 Tab 在自己的导航、重新聚焦或安全刷新时重新检查。显式纠错在操作 Tab 立即生效，在其他 Tab 下一次本地提交前生效；账号失效、隐私清除等安全事件则可以立即关闭所有受影响投影。

Tab 关闭后删除其 session 状态。持久缓存里禁止使用裸 tabId 当长期主键，避免浏览器重启后复用编号导致串线。

## 12. Active Candidate Pool｜有界候选池

候选池分成“自动池”和“当前 anchor 的保护集”。自动池最多 64 个；保护集不受 64 或自动可见上限的静默截断。

| 自动候选来源 | 初始边界 | 语义 |
|---|---|---|
| 最近有合格活动 | 最近 10 天，最多 40 个 | 真正前台使用，不是仅渲染过 |
| 最近打开的不同 Chat | 最近 32 个，观察记录不超过 45 天 | 防止低频任务过早退出 |
| 当前工作 session 的已合格使用 Chat | 最近 8 个 | 增强本次工作的连续性 |
| 自然渲染列表的冷启动种子 | 最多 12 个普通 Chat 的标题与链接 | 只是弱候选，不伪造打开时间 |

合并去重后，先保留前台合格活动及输入活动，再按最后合格使用时间、最近使用序号、稳定 ID 排序截为 64。种子不挤掉已有真实活动候选。不得滚动加载、模拟点击或主动翻页来扩大池。

当前 anchor 无论多老都必须可进入；A 的显式 include 作为保护集按需读取；原生固定行由呈现契约保护。人工规则很多时采取分页读取与滚动呈现，不以“最多八个”为理由删除人工决定。

候选池小于完整历史是产品边界，不是“其他聊天不存在”的事实。池外聊天始终可以由原生入口打开，打开后重新参与计算。

## 13. Activity model｜活动模型

活动分成观察与合格使用。`row_observed`、`route_observed` 是事实观察；`qualified_visit`、`rendered_user_input_added`、`foreground_transition`、`alternation_episode` 才参与较强关系学习。

合格访问：页面在前台连续可见至少 10 秒，或确认新增一条已经发送并渲染的 user input。小于 3 秒的快速进入退出记录为可能的误入／找错，不当作相关性正例。3～10 秒的访问可记导航但不升级为强关系。

只统计在真实前台窗口中的有效焦点序列。背景中放着两个 Tab 不算共同工作；Tab 复制与浏览器恢复不算主动共用。30 分钟无合格活动后开始新的工作 session。跨 Tab 信号也必须经过前台序列验证，不能把两个不同窗口各自的后台活动混成一次切换。

每个事件带 eventId、scope、conversationKey、观察时间、实例／epoch、source、qualification、provenance。消息的 authoredAt 未知时与 observedAt 分开；首次安装时读取到旧 user message 不算“刚产生新消息”。不采集未发送草稿、击键内容或剪贴板。

## 14. Conversation relation model｜聊天关系模型

使用稀疏的定向边：`Edge(A→B)`。直接语义关系可共享无向事实，但“B 对打开 A 的用户是否值得露出”以及显式规则必须按方向计算。A 需要 B，不代表 B 的侧栏必须充满 A 的全部邻居。

每条边保存 semanticAssessment、semanticEvidenceHashes、behaviorAggregates、independentEpisodeCount、distinctSessionCount、lastQualifiedCoUse、hubPenaltyInputs、revision。人工规则独立存储，不塞进一个会被平滑或衰减的浮点权重。

不得根据 A↔B、B↔C 自动认定 A↔C；不运行连通分量作为工作区，不把整个图邻居取并集。每个自动候选必须对当前 anchor 具有直接依据，短期继承除外，且继承有独立约束。

V0.1 不使用图数据库、GNN、在线梯度训练、聚类服务或向量数据库。IndexedDB 中的有向邻接记录及本地规则足够表达本轮假设。

## 15. Semantic evidence model｜语义证据包

**只使用可靠归属于该 Chat 的、已经发送且当前或曾自然渲染的 user input。** 不默认取 assistant reply，不自动扫描长对话，不下载附件，不进入后台补读未打开的 Chat。

| Packet 字段 | 内容 |
|---|---|
| 身份／版本 | request-local chat alias、schemaVersion、extractorVersion、evidenceHash、coverage |
| 标题 | 当前观察到的 title；记录是否为疑似默认标题 |
| 起始实质输入 | 仅在确实观察到时提供；否则 firstInputCoverage=unknown |
| 代表性输入 | 最多 2 段，去掉重复后保留任务／产物／依赖信息 |
| 最近输入 | 最多 2 段，记录观察顺序和相对时间 |
| 最小上下文 | 对“继续／这个／按刚才”保留必要的相邻 user input，仍无法解释则 unresolved |
| 证据缺口 | attachmentOnly、missingAntecedent、partialHistory、uncertainRole、routeOwnershipUnverified 等 |
| 提取边界 | 每段来源定位、截断位置、是否脱敏、是否去模板，不把摘录称作完整原文 |

每个 Chat 的选段总预算上限 800 tokens；整个请求包含指令、schema、anchor 与最多 6 个候选后上限 6,000 input tokens。实际 batch 大小由预算决定，不保证塞满六个。预算不足时减少候选或文本，而不是静默突破。

优先保留真实任务目标、产物名、依赖和当前进度；重复的执行协议／授权模板不应支配相似性。去模板与脱敏是版本化派生处理，不覆盖原始来源定位。不得利用 title 与模板共有词把所有“继续开发”认定成同一工作。

模型输出只允许：候选 alias、relationType、evidenceSufficiency、支持判断的已给 excerpt IDs、missingContext 和简短 reasonCode。relationType 为 same_task、supporting_task、same_work_environment、topic_only、unrelated、unknown。

模型自报 confidence 不作为校准后的概率。`unknown`／上下文不足不等于 unrelated；材料缺失时不靠升级大模型“猜对”。所有引用 ID 必须在当前包内存在，模型不能凭空发现另一个 Chat 或读取更多历史。

## 16. Behavioral signal model｜行为信号模型

行为分数 B 取值 0～1，来自四项饱和、按时间衰减的量：直接合格切换 Tn、A→B→A 回访 An、跨 Tab 前台交替 Fn、短工作 episode 共用 Pn。初始公式为：

`B = 0.45×Tn + 0.35×An + 0.15×Fn + 0.05×Pn`。

Tn 在 6 次加权合格切换处饱和，An 在 3 次回访 episode 处饱和，Fn 在 4 次合格焦点交替处饱和，Pn 在 3 个短 episode 处饱和。重复自动事件先去重，同一次 episode 内的快速连点不无限累积。

“稳定学得行为”需要至少 3 个合格共用 episode、横跨至少 2 个工作 session，且至少存在一次独立依据：从非 ACS 投影入口主动往返，或在两个 Chat 中均有实质输入。只在同一个推荐列表里反复点击，不足以自动晋升为最高的学得层。

ACS 自己展示的链接产生的普通点击，初始学习权重为 0.25；原生列表、搜索、直接链接及确实主动的 Tab 切换为 1。明确在两端实际工作的输入证据按其本身计权，不被界面来源折扣。该设计用于减轻推荐反过来训练自己的反馈闭环。

未点击不是负例；AI 判断不相关也不能抹去已经稳定的真实共用。Hub 热度只用于同层排序微调，不否定用户对通用监管 Chat 的稳定需求。

## 17. Relation scoring / selection policy｜评分与选择

先做可访问性、scope、来源与人工规则检查，再按权威层选择。不能用“大权重”假装人工规则绝对优先。

**约束顺序：** 无效／不安全对象拒绝 → 当前 anchor → native protected rows／人工 include → 人工 exclude 从自动候选剔除 → 稳定学得行为层 → 语义或强任务证据层 → 有界临时继承。当前 anchor 不允许被“从自己的上下文排除”。

语义 S 的初始映射：same_task=1.00，supporting_task=0.85，same_work_environment=0.65，topic_only=0.25，unrelated=0，unknown=缺失。证据不充分的语义不得用于自动晋升。

任务证据 J：明确引用对方 Chat／同一唯一产物依赖为 1；经验证的同一具体任务谱系为 0.65；只有相同仓库或泛化主题为 0.20。没有证据为 0。PAIA、开发、论文等普通共有词不构成强 J。

关系强度按以下确定性初始策略计算：

`Ib = 已达稳定行为门槛 ? 0.80 + 0.20×B : 0.60×B`  
`Is = 语义充分时 0.90×S + 0.10×J，否则该项缺失`  
`I = max(Ib, Is, J)`  
`Q = clamp(0.85×I + 0.15×R − 0.06×H, 0, 1)`

R 为候选最近合格活动的新鲜度；H 为独立行为边的 hub 程度，归一到 0～1。Hub 不按“被算法推荐过多少次”计算。缺失 S 不当作负判断，也不把剩余权重机械放大成确定关系。

自动新晋门槛 Q≥0.72；既有成员维持门槛 Q≥0.50；满员替换还需要新候选高出至少 0.12，并经过稳定性约束。同一权威层才按 Q 排序；合格的稳定行为不会仅因为较低层 AI 打分高就被挤走。

默认自动目标为 6 个、自动上限为 8 个，包含 anchor，不含额外人工／原生保护项。没有足够依据时可以只有 1～2 个，绝不凑数。自动池里发现大量同等合格项时，宁可增加 Others 使用，也不把 UI 变回几十个推荐。

## 18. Decay model｜衰减模型

统一衰减形式为 `weight(age)=2^(−age/halfLife)`，基于事件发生／观察时间重新计算，不依赖后台计时器持续运行。初始半衰期：合格共用行为 14 天；候选新鲜度 5 天；短期继承不采用无限衰减，采用明确期限。

语义事实不因时间经过变成“无关”。但语义陈旧度会触发重新验证，是否值得此刻露出仍受候选池与近期使用影响。长久不活动的聊天自然不再进入自动池，而不是被删除或重新分类。

显式 include／exclude 永不自动衰减。人工 include 可保留长期参考聊天；这种超出近期性的例外是用户选择，不应被算法纠正。

页面持续打开时，不因午夜、日期桶翻转或衰减的一点变化立刻移除条目。衰减只在允许的重算与提交节点影响下一视图。

## 19. Stability / hysteresis｜稳定性设计

冻结三个层次：anchor 的基线邻域、当前 Tab 的已呈现顺序、正在使用的连续性 lease。分数变化只产生 pending proposal，不直接操作 DOM。

同一集合内点击时，保留已呈现成员及其顺序，先只改变选中状态。对于具有直接依据的老成员使用较低维持门槛；未经新 anchor 证实的继承项最多保留一个 120 秒的 lease，到下一个安全提交点清理。lease 起点不能靠连续 A→B→C 跳转反复重置；只有直接依据或人工规则才能把条目转为正式成员。

已选自动成员的最低驻留时间为 120 秒；同一 Tab 自动成员提交间隔至少 60 秒；anchor 不变时，最多自动替换 1 个成员／5 分钟。用户明确改规则、账号失效、无访问权限、原生删除等安全或显式操作可打破驻留。

pointer 在侧栏、键盘焦点在列表、上下文菜单展开、拖动或滚动中、Others 展开时，都不做自动成员变更。必要 proposal 留待交互结束；绝不在鼠标指向某行时把它换成另一个目标。

V0.1 不再叠加独立 EMA：衰减后的行为聚合、不同晋升／维持门槛和提交节流已经提供平滑；再次平滑最终分数会混淆“旧证据”和“时间衰减”。同一份证据重复重算不得增信。人工规则、安全状态及已到期的继承资格不平滑。rich new-chat 明确换题时使用冷启动专门策略，不受普通晋升次数约束，但仍保护正在交互的侧栏。

继承 lease 到期本身不触发时钟驱动的屏幕跳变；到下一次本 Tab 导航、焦点回归或其他安全提交点才重新校验。到期项若仍无直接依据，必须在该次提交中清理，作为生命周期清理单独记录，不受普通“1 个／5 分钟”的分数替换预算阻挡。最低驻留也不能为已失去安全／来源资格的条目续命。

同一 anchor 的当前屏幕不会因为其他 Tab 产生新证据而立即变化。保留旧次序不代表把旧集合永久绑定给新 anchor：未证实继承会过期，不做多跳关系闭包。

## 20. Manual override semantics｜人工纠错

V0.1 只有一个定向规则表：`ManualRule(scope, anchor, candidate)`；状态为 include、exclude 或无规则。规则带 ruleRevision、createdAt、updatedAt、operationId、source，并保留有限的本地撤销历史。

“总与当前聊天一起显示 B”写 A→B include；“不与当前聊天一起显示 B”写 A→B exclude。两个动作都必须明确显示作用对象，例如“打开 ANS-04 时，不显示简历优化”。不使用含糊的“永久删除”或“移出工作区”。

同一方向只能有一个当前规则；最新成功的显式操作替换前一状态。多 Tab 冲突用 expected revision 检测，冲突时重读并让本次动作基于最新状态重试，不按不同设备时间戳静默覆盖。撤销只撤销相应操作，不能覆盖之后更新的规则。

A→B include 不自动创建 B→A include；也不为当前集合中的每一对成员批量写规则。用户多次纠正不同 anchor，是多个可追溯决定，而不是训练数据压缩后的隐式权重。

人工规则超过自动上限时允许列表增长，保留滚动和可见固定标记；不能静默淘汰。规则不越过安全范围：无法验证 scope、失去原生访问、被原生明确删除或当前不可投影的对象不能强行展示；保留规则并给出“当前不可用”，不伪造有效链接。

## 21. WorkingSetCache｜工作集缓存

拆成两个缓存，避免“一个监管 Chat 只有一个固定工作区”：

| 缓存 | 键 | 内容 |
|---|---|---|
| `BaseNeighborhoodCache` | scope + anchor + policyMajor + capabilityMode | 当前直接邻域及确定性基础顺序 |
| `TabViewSnapshot` | browserSession + tabId + instanceNonce | 本 Tab 最终可见顺序、lease、局部交互状态 |

基线缓存包含 schemaVersion、baseRevision、computedAt、anchorEvidenceHash、dependencyDigest、manualRevision、candidateEpoch、相关 source lifecycle revisions、memberReasons 和 expiry。每个 Tab 的继承项不得回写成其他 Tab 的全局基线。

soft TTL 为 10 分钟；超过即允许 stale-while-revalidate。超过 24 小时的旧自动成员不直接复活，先重新通过当前候选池和本地规则。人工保护项独立读取；离线也不能绕过 scope／exclude 检查。

**硬失效：** scope 不匹配、隐私授权撤回、数据 purge、schema／policy 不兼容、相关人工规则改变、目标已确认不可访问、投影能力失效。  
**软失效：** 新活动、语义包变化、行为边更新、候选池变化、TTL 到期。

软失效不会让每次导航变成 cache miss；优先使用经当前硬约束重新过滤的旧集合，再安排异步重算。全局 graph revision 改变不使全库缓存失效，只标记实际受影响的 anchor。

新导航或焦点回归是本地刷新触发；语义刷新另外接受预算、内容 hash、空闲时间与授权检查。相同依赖版本的并发请求合并；失败不清空可用基线。

## 22. New-chat cold start｜新聊天冷启动

状态为 `TRANSIENT` → `BOUND_THIN` → `INFORMATIVE` → `ESTABLISHED`。这些是证据状态，不是依据消息数量机械计数。

TRANSIENT 没有可靠持久身份；只在当前 Tab 内继承上一视图，不能与旧 Chat 合并。出现持久 identity 后原子绑定，成为 BOUND_THIN；“帮我看一下”“继续”等不能触发全新语义邻域。

INFORMATIVE 需要有可理解的任务目标和至少一类任务对象／产物／约束，且核心指代已解析。第一条富信息 prompt 可以直接到达；长篇模板、只传附件、泛化指令不会仅因长度过关。信息充分性先做确定性筛查，再由一次有预算的语义判断确认。

新 Chat 默认继承来源 Tab 的邻域，记录 inheritedFrom 与 lease 起点。若没有来源 Tab 或继承已不安全，显示原生列表；不把最近任意几个 Chat 当成其工作环境。证据不足且 lease 到期时恢复原生浏览，而不是强行分类。

若充分证据明确表明换题，且当前有可靠新邻居，在一次安全边界完成替换；保留当前新 Chat，避免一条条跳动。如果只知道换题却不知道新邻居，可以只保留 anchor 与 Others，不强迫找出三个相关 Chat。

未确认原生成功保存的新消息，不能被当成永久 conversation identity 或全局活动。Temporary Chat 不入库、不调用语义、不从临时文本训练关系。

## 23. Others behavior｜Others 的精确定义

**Others 是原生浏览模式的入口，不是扩展维护的“全集减当前集合”数据库。** 打开后恢复原生 conversation list 及其自然分页／懒加载，保留原生搜索；当前集合中的聊天也可能在其中出现。

官方说明，旧聊天不在侧栏中不等于已删除；原生搜索可以找回相关历史，归档聊天的可见性也不同。因此不能用扩展缓存数量当“其他聊天总数”。[S13]

展开时收起上下文投影，不在同一个区域堆叠两份相同列表；顶部只保留返回当前列表的轻量入口。不得移动原生列表 DOM 进扩展容器。用户的原生滚动状态尽力保留，并由 R0 实测。

在 Others 中滚动、打开原生菜单、搜索但未选结果，不自动收折。实际成功打开一个目标 Chat 后，依据新 anchor 返回上下文模式；导航失败或目标不可用时保持原生模式。按返回按钮可恢复先前仍安全的快照。

Others 只承诺保留原生可达能力，不承诺绕过 ChatGPT 自身缺失、权限、网络或删除限制。扩展自己的诊断中可以显示“已观察候选数”，不能显示“总历史数”。

## 24. Native sidebar integration｜原生侧栏集成

**生产候选方案冻结为 Native-slot Projection：在经验证的普通聊天列表槽位中显示扩展自己的有界小列表，原始列表留在原位置，切换 Others 时原样恢复。** 这不是右侧面板，也不是重建整个 sidebar。

必须正视两条工程限制：单纯过滤不能显示尚未渲染的相关 Chat；保留原生行也未必能维持希望的固定顺序。因此“只过滤行”作为 R0 的较低侵入能力试验与有限降级路径，而不是宣称已经完整解决主体验。

投影行使用本地已验证的 ConversationRef 与实际观察 URL。不要克隆原生 React 节点，不搬移原生行，不拷贝隐藏 handler，不模拟其内部菜单。使用正常导航链接；能否保持原生 SPA 导航与 Cmd/Ctrl+Click、中键、键盘打开等语义，由真实浏览器测试决定。若只能全页重载且显著破坏体验，该导航 gate 不通过。

投影中的扩展菜单只提供关系纠错与“在原生列表中操作”。重命名／删除／归档继续由原生模式处理；不能把这项差异隐瞒成“所有原生行菜单完全不变”。这是只改列表显示所需的有限交互让步，须在产品试验中验收。

原生 lazy loading／virtualization 必须通过实测：遮蔽列表不能导致加载哨兵持续触发、无限请求、滚动条异常、Project 被牵连或恢复后空白。若不存在可安全隔离的槽位，不转移整个 sidebar，不靠私有 API 修补，判 NO-GO。

扩展内容默认不应遮住原生内容；只有身份、边界、投影挂载与恢复路径全部就绪后，才授予短期 conceal lease。DOM 发生未知重建时先恢复原生，再重新探测，而不是继续扩大 selector。

## 25. Projects non-interference contract｜Projects 零干预契约

OpenAI 把 Projects 定义为聚合聊天、文件和指令的上下文空间，移动聊天可能改变其继承的上下文。本产品不调用、模拟或改写这些操作。[S14]

Project 树、项目列表、展开状态、标题、菜单、拖动、成员及其位置都属于 Protected Surface。New Chat、Search、账号、设置及其他非普通聊天区同样保护。扩展不得给这些节点加隐藏 class、移动它们、拦截其点击或覆盖原生属性。

Project Chat 可以作为当前 anchor。普通列表槽位里可出现指向相关 Project Chat 的“额外快捷链接”，但必须满足：它是已观察且当前 scope 可验证的链接；不自动添加整个 Project；显示轻量 Project 标记以免误认为改了归属；原生 Project 中的入口继续存在。

这是纯导航重复入口，不是复制或移动聊天。如果当前布局只显示 Project 专属子列表而没有可隔离的普通聊天槽位，则不注入投影，保留原生 Project 页面。未知 Project 状态不推断为普通聊天，也不靠猜 URL 绕过保护。

## 26. DOM adapter architecture｜DOM 适配器

所有 selector、可访问名称匹配、路由解析和正文角色识别集中在 `ChatGPTSurfaceAdapter`。领域模型、评分、存储、AI provider 不得引用 DOM selector。

| 能力 | 输出／失败值 |
|---|---|
| resolveScope | verified binding／unknown／conflict |
| resolveConversation | durable identity／transient／unsupported |
| locateSurfaces | ordinary slot、protected regions、ownership proof |
| observeRenderedRows | 有界、带来源的普通／Project／unknown links |
| verifyContentOwnership | 当前 route 对应正文的可验证证明／unverified |
| readVisibleUserEvidence | 有界摘录、角色／归属／覆盖范围 |
| mountProjection／concealNative | reversible patch handle／拒绝 |
| restoreNative | 幂等还原及残留检查 |
| validateHealth | capability flags、版本、失败原因 |

能力分为 navigation、scopeIsolation、safeOrdinarySlot、reversibleConceal、linkNavigation、projectProtection、userRoleExtraction、contentOwnership。禁止一个“大概支持 ChatGPT”的布尔值盖住逐能力缺口。

采用“探测—计划—校验—提交—回滚”流程。Patch ledger 只记录扩展自己加的节点、样式及带命名空间的标识。恢复时只撤销自己的写入，不按旧快照覆盖后来由 ChatGPT 更新的原生属性。

MutationObserver 只监听必要边界和当前正文子树；批次合并、限制单批处理量，忽略自己的标识更新。禁止每一次流式输出都扫描全页面。页面结构碰撞、重复挂载、未知新分区、保护区域混入均触发 fail-open。

默认恢复目标：检测到错误后的下一次可用绘制机会开始还原；可执行但通信中断时 2 秒内撤销遮蔽。原生可见性不能仅依赖一个可能已经崩溃的清理回调；R0 必须验证独立 lease 到期或等效机制。浏览器渲染进程冻结时无法承诺物理意义的“立即绘制”；重新运行后先恢复原生。扩展强制卸载／禁用的残留必须单列测试，最差需刷新才能恢复的情况不得包装成无损即时恢复。

## 27. Local-first storage model｜本地存储

核心数据位于扩展自身 origin 的 IndexedDB，由扩展 service worker 负责验证消息和执行事务；不能在 ChatGPT 页面 origin 的数据库里保存整个关系图。内容脚本只持有当前 Tab 的最小工作副本。

| 存储 | 保存内容 | 禁止内容 |
|---|---|---|
| IndexedDB | refs、活动、有界关系、人工规则、证据、基线缓存、队列、修订／purge 信息 | ChatGPT 登录令牌、完整聊天档案 |
| chrome.storage.local | 启停、同意版本、安装标识、策略版本、小型诊断设置 | 全图、大量正文、API key |
| chrome.storage.session | 当前浏览器会话 Tab 状态、临时 lease、in-flight 引用 | 唯一持久规则来源 |
| 内容脚本内存 | 当前可见快照、小型预热 map | 全历史、跨 scope 的所有证据 |
| 本机凭证保管 | 用户自有 API 凭证，仅 helper 可取用 | 回传 key 给网页或扩展 DOM |

Chrome 的 session storage 会在扩展重新加载／更新／禁用或浏览器重启时清空；默认不暴露给内容脚本。service worker 也可能因空闲被终止。因此进程常驻和内存队列都不能作为正确性前提。[S04][S05]

所有关键写入以事务完成；事件 operationId 去重；人工规则、purge 和预算预留在成功提交后才报告完成。耗时外部请求不能包在长期 IndexedDB transaction 中。模型任务队列先记录状态，重启后重读，再按 idempotency ledger 决定可否重试。

保留策略：原始活动事件 14 天；按日行为聚合 90 天；自动基线缓存最多 128 个且最长保留 30 天；自动证据摘录离开活跃范围后 14 天清除；无人为规则引用的自动 ConversationRef 最长 180 天、总量最多 2,000 个；自动边按每个 anchor 最近／最相关 32 条裁剪。人工规则及其最小身份记录不随这些上限自动删除。

超过本地预算先清理可再生缓存和摘录，再裁剪自动记录；不删除人工 include／exclude。自动压力清理只处理可再生数据。用户明确选择“忘记此 Chat 的全部扩展数据”时，则同时删除相关证据、自动边、关联人工规则、缓存与排队请求，增加 purge generation；晚到响应不能重新造出已清除的数据。“只清缓存”与“忘记全部数据”必须在确认文案中区分，不能让保留的人工规则冒充已彻底遗忘。

本地存储不等于加密存储，也不等于不能被本机恶意软件读取。导出默认仅导出规则和元数据；包含摘录须单独选择并明确敏感性。迁移失败恢复原生 UI，保留旧数据而不是清库“修好”。

## 28. OpenAI API architecture｜正式 API 架构

### 28.1 V0.1 的模型与运行模式

本次查阅的官方目录将 GPT-5.6 Luna 定位于成本敏感工作负载，其文档列出 Responses API 与 Structured Outputs 支持；Terra 也支持结构化输出。[S08][S09] 据此冻结初始配置：默认 `gpt-5.6-luna`，确有必要时升级 `gpt-5.6-terra`。这不是用户数据实测最优结论。

默认使用无工具、纯文本、低推理开销的结构化关系判断；不要调用 web、file search、computer use 或模型工具。普通模式优先 `reasoning.effort=none`，精确请求字段以实施时官方 API contract test 为准；不能因参数错误退回非结构化自由文本并照单执行。

文档此次没有提供可确认的不同日期 snapshot ID，因此不能编造日期后缀声称模型已锁死。记录请求的真实 model ID、返回 model、prompt/schema/extractor 版本、测试日期与 golden fixture 结果；可验证 snapshot 出现后再通过 amendment 固定。别名有漂移风险，重新启用／升级前跑小型回归。

### 28.2 凭证与部署边界

官方明确不应把 API key 部署到浏览器等客户端环境。[S07] 因此本文件不把“key 放 chrome.storage.local”“前端加密后再由前端解密”视为安全方案，也不共享开发者自己的 key。

**V0.1 的选择：扩展默认本地行为模式；AI 通过用户自有本机 Native Messaging helper 接入正式 OpenAI API。** helper 保管用户凭证，执行允许的单一关系判断操作；不托管聊天库，不提供云端账号，不开放通用 shell、文件操作、任意 URL 代理或浏览器自动化。

Chrome 正式支持扩展通过 Native Messaging 与注册的本机程序通信；host 可限制允许的 extension origins，内容脚本须经 service worker 转发。[S06] helper 安装与凭证配置是一项真实的一次性使用门槛，不应宣传成“零配置 AI”。首个 helper 仅需覆盖 macOS 试验环境；无需构建通用桌面平台。

公网代理／团队托管 API 服务延期，因为它会带来认证、费用滥用、留存与运维问题。用户不安装 helper 或不授权上传，行为模式仍完整可用；但交付验收仍要证明 AI 通路工作，不能用“可选”规避本轮 AI 设计。

### 28.3 请求、缓存与调度

仅当证据充分、相关 pair 缓存缺失／内容改变、该判断可能改变候选选择，并且预算允许时调用。打开 Chat 本身不是调用理由。每个 anchor 合并最多 6 个候选；同一 scope 最多 1 个进行中请求；候选池增大不触发全对全计算。

本地语义键为 scope + 有向pair + 两端evidenceHash + promptVersion + schemaVersion + extractorVersion + modelPolicyVersion。基础语义判断与行为打分分开：仅浏览次数变化不会重做 GPT 语义。同一 evidence 内容 hash 不带 observedAt 或 lastOpenedAt，避免时间戳导致全量失效。

足够证据的新包合并等待至少 30 秒；同一 anchor 5 分钟内最多开启一次普通语义刷新。请求逻辑期限 20 秒；取消只取消本地继续等待，不承诺服务端已停止计费。任务由 durable queue 与预算 ledger 跟踪，不依赖 service worker 永远活着。

Structured Outputs 带严格 schema、所有字段约束和 unknown 路径。文档明确需要处理模型 refusal；截断、拒绝、schema 不符、非法 alias、证据引用失效一律作为失败，不生成肯定关系。[S11]

升级 Terra 仅适用于“证据充分但关系边界有真实歧义，且会影响当前选择”的少量 pair；缺少上下文、HTTP 错误、鉴权失败不是升级理由。每个 packet hash 最多升级一次；默认一天最多 1 次。默认 Luna 每天最多 20 次；另受金额上限约束。

### 28.4 成本与账单保护

2026-09-19 查阅到的 Standard／短上下文价格：Luna 输入 $0.20、输出 $1.20／百万 tokens；Terra 输入 $2.00、输出 $12.00／百万 tokens。官方另列 cache write、cached input、长上下文与不同服务档位价格。[S10]

以下为计算示例，不是实际账单预测：一次 6,000 input + 1,200 output tokens，Luna 约 $0.00264；Terra 约 $0.0264。每天 20 次前者加 1 次后者、持续 30 天，按该普通输入／输出费率约 $2.376。若所有输入按当页列出的 1.25 倍 cache-write 费率计，保守示例约 $2.646。未包含税费、失败重试或其他账号用量。

冻结本工具默认本地金额预算为 $0.10／日与 $3／月，发送前按最大可能 token 和当前已验证价格做原子预留。额度不足就停 AI，保留行为侧栏。usage 回来后结算；状态不明的请求暂按预留占用，防止重启后重复花费。

模型／价格未核验、计费字段未知或输出 token 无法保守计入时，禁止静默继续。包括 reasoning tokens 在内的计费输出按 API usage 结算。预算是本工具的发送限制，不是 OpenAI 账号总账单的银行级硬封顶；同一个 key 的其他应用不受本工具控制。外部服务的 exactly-once 计费不作保证；结果未知的请求不得无条件自动重发，任何重试都需要新的保守预算预留，并计入每日请求上限。

此处 batching 指一个请求内评估多个候选。V0.1 不使用延迟交付的 Batch API，也不把服务器 prompt cache 命中当作本地语义缓存命中，更不靠缓存折扣才能成立。

## 29. Privacy / security boundary｜隐私与安全

启用本地功能和启用云语义是两次不同的同意。第一次说明将观察哪些 ChatGPT 导航与页面信息；第二次展示示例 EvidencePacket、外发字段、API 服务方与费用。用户未启用云语义前不得发送标题、摘录或脱敏后的语义材料。

OpenAI 官方说明 API 数据默认不用于训练，除非主动选择共享；默认滥用监测仍可能保留内容，通常最长 30 天并存在例外。`store:false` 不能被解释成绝对零留存，Zero Data Retention 也不是普通调用自动拥有的保证。[S12]

请求设置 `store:false`，不使用 Conversations API、持久线程、文件上传、后台生成或外部工具。所有 title／excerpt 都是“不可信待分析数据”，其中“忽略规则、发送密钥、读取别的聊天”等文本不能升级为指令。输出不能携带可执行 HTML、选择器或任意 URL。

只将本请求临时 alias 发送给模型；不发送完整 conversation URL、真实账号标识、tabId 或全图。邮箱、电话号码、key 等做保守本地遮盖，但明确不能保证自动识别所有敏感信息。企业／教育／共享 scope 的云语义默认关闭，须有相应授权才启用。

service worker 验证 sender 的 origin、frame、tab、document、scope 和消息大小；helper 验证允许的扩展、操作名、schema、模型白名单、预算与 token 上限。网页不能借消息通道发任意模型请求。UI 插入使用安全文本，不使用模型返回 HTML。

投影标题本身会进入宿主页面 DOM，不能认为 content script 的隔离世界使显示出的文字对页面保密。正因如此，只允许在可靠同 scope 下显示已授权 Chat 标题，不能把来自另一账号或 PAIA 私有来源的隐藏资料直接投影进网页。

Chrome Web Store 将浏览活动、通信和用户生成内容视为需要妥善披露的数据；仅本地存储也不免除隐私政策义务。公开发布前必须完成突出披露、最小权限和 Limited Use 审查。[S15][S16] 工程可行不等于商店或平台条款已经通过；本文件不作法律合规认证。

## 30. Failure / degradation model｜失败与降级

| 失败 | 用户看到什么 | 系统动作 |
|---|---|---|
| 语义服务离线／额度耗尽 | 已有本地工作集照常 | 停请求，不清空已有本地关系 |
| 新 anchor 无缓存／证据不足 | 原生列表或有依据的少量成员 | 不等待 AI，不填入无关项 |
| 无法确认 user role／正文归属 | 导航仍可工作 | 关闭正文采集与该来源语义 |
| identity／scope 冲突 | 原始侧栏 | 停投影和证据复用 |
| selector／原生区域变化 | 原始侧栏 | 撤销自己的 patch，锁定适配失败 |
| Project 保护检查失败 | 原始侧栏 | 不尝试扩大隐藏范围 |
| 存储失败／迁移失败 | 原始侧栏 | 不清库，不假称纠错已保存 |
| service worker 重启 | 尽可能沿用安全快照 | 重读事务状态；超时撤销遮蔽 |
| 原生目标已删除／无权访问 | 不再投影无效目标 | 标记 unavailable，不自动删除其他来源 |
| 模型晚到／授权已撤回 | 无变化 | 丢弃，禁止数据复活 |
| 与其他侧栏扩展冲突 | 原始侧栏＋一次性提示 | 不争抢 DOM 控制权 |

恢复原生不依赖模型、网络或数据库查询。短时间连续 3 次适配失败后停止该页增强，避免闪烁式自动重试；用户手动重试或经过验证的新 adapter 版本才重新启用。

必须区分“没有看到一条记录”和“记录被删除”。普通列表没渲染到、请求失败、网络超时或权限暂时不明，不能作为原生删除证据。扩展不轮询后台来检测所有聊天删除。

## 31. PAIA future integration boundary｜未来与 PAIA 的边界

V0.1 使用独立命名空间、存储与实现包，不修改 PAIA mainline，不读取其 IndexedDB，不要求其先完成某个 round，也不复制其运行事实。

未来可提供三类只读 provider：ConversationIdentityProvider、ConversationEvidenceProvider、SemanticContextProvider。它们输出有 provenance、coverage、schemaVersion、permissionScope、sourceRevision 的显式契约；ACS 消费数据，但仍由自己的 attention policy 决定 Working Set。

PAIA Topic 只能作为弱语义线索，绝不能直接变成 sidebar group。PAIA 的原话真实性、来源关系、删除和撤销授权必须被继续尊重；外部 provider 删除的证据通过 invalidation／purge 影响 ACS 缓存，不能保留影子副本。

未来 provider 缺失或版本不兼容时，退回本扩展自己观察到的证据。没有循环依赖：PAIA 不必知道 ACS 的临时 TabViewState，ACS 也不替 PAIA 修改 Topic Catalog。

## 32. V0.1 exact scope｜精确范围

V0.1 包含：独立 Chrome 扩展；经验证的原生普通列表投影；Others 恢复；公开 URL 身份与 SPA 生命周期；scope 保护；每 Tab 独立视图；最多 64 自动候选；直接关系及行为规则；定向 include／exclude；有界证据包；Luna／有限 Terra 正式 API 通路；本机 helper；本地缓存与保留策略；一次性同意；最小诊断与安全导出／清除；完整测试与单用户试验。

行为模式是安全基线，也是实验对照。语义模式必须能够真实运行和被关闭；不得强制每个人配置 API，也不得将“AI 模块暂未实现”的版本标记为整个 V0.1 完成。

真实 scope 与 native-slot 可维护性门槛未通过时，不发布带历史缓存投影的正式版本。可以记录 private spike 的结果，但不能用一个看似可用的 demo 替代已定义的失败判定。

## 33. Explicitly deferred features｜延期清单

延期内容包括：显式工作区、隐式聚类／聚类命名、嵌套目录、tags、全历史扫描、Topic 自动生成、云同步、协作、多平台适配、移动端、泛化 Windows／Linux helper 安装器、托管代理与计费系统、用户账号、独立 Web App、完整原生行菜单仿制、后台抓取未打开聊天、assistant reply 默认采集、附件解析、主动探索插入、在线模型训练和 PAIA 实接。

这些功能不能通过“方便实现”“以后会需要”“架构先铺好”提前进入当前 round。诊断不演化成 dashboard；scope 绑定不演化成用户管理 Workspace。

## 34. Test strategy｜测试策略

测试需要覆盖纯领域逻辑、浏览器集成和真实站点三层。fixture 可以证明规则正确，不能证明当前 ChatGPT DOM 支持；真实站点小样本可以发现兼容问题，也不能替代所有状态机测试。

| 层次 | 重点 |
|---|---|
| 单元／性质测试 | 人工规则优先、定向性、无传递闭包、未知不等于无关、预算与边界 |
| 确定性 replay | 同一输入／策略产生同一基线；多跳继承不会永久扩张 |
| 存储／并发 | worker kill、重复事件、事务回滚、multi-tab revision 冲突、migration、purge |
| adapter fixture | ordinary／Project 混合、重复标题、空列表、虚拟化、未知区域、新路由 |
| 真实 Chrome 集成 | Search、URL、Back／Forward、BFCache、Tab 复制、新 Chat 绑定 |
| UI／无障碍 | 键盘焦点、正常链接语义、屏幕阅读器、字号／缩放、浅深色、原生菜单 |
| 安全 | scope 切换、prompt injection、恶意链接、消息通道伪造、API key 泄漏、关闭外发 |
| 语义 | 同主题不同任务、不同主题同工作、模板近似、指代缺失、附件依赖、hub Chat |
| 故障注入 | DOM 重建、失去权限、关闭扩展、断网、模型超时／refusal／坏 schema |

隐私测试用合成含“伪密钥”的夹具，不把真实 key 放入截图或日志。真实页面抓取出的 DOM fixture 在保存前剥离正文、账号和敏感标题；仅保留验证所需的结构。

原生功能回归包含 New Chat、Search、Projects、原生 Pin、删除／归档／重命名入口、折叠侧栏和账号操作。若某个版本未支持其中场景，必须给出 passthrough 而不是“测试跳过但仍算通过”。

语义评估不以模型自评当金标准。先做合成边界和确定性规则测试，最终用户只确认最有信息量的少量边界样本；不得用测试期未来活动回填过去的关系后再宣称预测成功。

## 35. Product metrics｜产品指标

最重要的两个结果：**找到目标聊天所需时间是否下降；持续工作时是否更少迷失。** Working-set 使用率只是过程指标。

| 指标 | 精确定义／注意事项 |
|---|---|
| Visible-set navigation coverage | 在导航动作发生前，目标是否已在该 Tab 可见集合；不得把新 anchor 加入后再计命中 |
| Candidate coverage | 目标在动作前是否在自动池或保护集；未知历史和池外旧 Chat 不能从分母静默删除 |
| Others open rate | 每 100 次合格导航的展开次数；区分正常换工作与漏掉当前所需 Chat |
| Missing-needed-chat rate | 经用户标注或明确任务脚本确认“本应在当前集合却没出现”；不能用算法自己定义真值 |
| Incorrect inclusion | 抽样询问是否值得同屏；没点击不能直接算错 |
| Manual correction rate | 每 100 次合格导航的 include／exclude 操作数及重复纠错数 |
| Sidebar churn | 同一工作连续段内自动增删数、交集成员顺序变化；手动动作、继承到期和真正换题分开统计，但同时报告所有变化的总数 |
| Time-to-target | 有明确意向起点的计时任务；自然浏览仅能给代理指标，不假装知道用户何时开始寻找 |
| Working-set size | 自动项与人工／原生保护项分别报告；不因用户保留九个而判错 |
| Original-mode preference | 用户主动持续关闭增强的时段／原因；比“分类准确”更接近产品否决信号 |

分母事前定义：普通持久聊天的成功导航全部记录，包括从 Search／Others／外部链接进入且目标原来不在池中的情况。新聊天创建、临时聊天、Project 专属原生页面等另报覆盖，不与已经可投影的普通导航混合美化结果。

试验以单用户、不同工作时段的交叉对照为主：原生、简单近期基线、行为关系、行为＋语义四个条件。尽量匹配工作任务，交替顺序；冻结评估切点之前的证据，防止泄漏。只对一个重度用户有效不能外推到普遍市场。

第一轮产品门槛是初始决策值：可比任务的目标寻找时间中位数降低至少 25%，末期当前工作切换覆盖达到约 80%，纠错不高于 3 次／100 导航，且用户没有更强迷失感。样本不足只能是 INCONCLUSIVE，不要求为了过 gate 强行调数字。

AI 增益门槛：相对同一行为基线，预先定义的 needed-chat 漏项率降低至少 20%（相对值），或切换覆盖提高至少 5 个百分点；同时不明显增加误入、churn、纠错和准备成本。达不到则保留可选 AI，默认关闭或停发该能力，不推翻有效的行为产品，也不把 AI 使用次数当成功。

## 36. Technical metrics｜技术指标

所有以下数值都是测试目标，尚未测量。

| 指标 | V0.1 目标 |
|---|---|
| 热缓存提交延迟 | 身份与安全槽位就绪后 p95≤100ms |
| 冷本地计算提交 | 同样前提下 p95≤200ms；超过不遮住原生列表 |
| 导航同步网络等待 | 0 次模型／扩展网络依赖 |
| UI 提交隔离 | 旧 epoch／其他 Tab 响应的错误绘制为 0 |
| scope／Project 错写 | 测试中 0 次；出现一次即阻断发布 |
| 自动候选处理 | 每次最多 64 个自动候选；无全历史扫描 |
| 自动边／缓存规模 | 每 anchor 自动边≤32；基线缓存≤128；保护规则另计 |
| 主线程阻塞 | 扩展引起的单任务尽量<16ms，任何可重复>50ms 长任务必须修复 |
| DOM observer 负担 | 只处理相关区域的增量；流式正文输出不触发整页扫描 |
| 故障恢复 | adapter 可执行时尽快回原生；通信失联恢复目标≤2s |
| 语义并发 | 每 scope≤1；相同 request key 合并 |
| 成本 | 不超过本工具发送前预留预算；未知用量仍占用预留 |
| 本地数据预算 | 自动数据目标≤25MB；压力清理不得删人工规则 |

cache hit rate、每活跃 Chat API 调用数、CPU、内存、原生额外请求数都要记录，但初期不靠不合理的固定高命中率掩盖新安装冷启动。计时起点须同时报告“用户点击”和“身份＋可控槽位就绪”，不能把 ChatGPT 自身迟迟未就绪的时间偷偷算掉后宣称所有点击都瞬时完成。

## 37. Staged implementation rounds｜分轮实施

本节只冻结未来实施顺序，不代表现在开始执行。每轮必须有独立范围、证据、远端状态与明确停止点。新建独立项目后再建立 canonical status；当前不存在已创建仓库或已通过 CI 的事实。

| Round | 范围与交付 | 明确不做 | 退出门槛 |
|---|---|---|---|
| ACS-00 | capability spike：公开身份／scope、SPA、ordinary slot、可逆过滤与投影原型、Others、Project 保护、多 Tab、恢复机制；提交能力报告与去敏证据 | 完整 UI、AI、关系算法、PAIA 接入 | 核心能力逐项 PASS，或具名 NO-GO |
| ACS-01 | 领域对象、scope 分区、storage、事件幂等、manual revision、迁移／purge 基础 | 可见智能侧栏、模型请求 | 确定性、并发、重启和数据隔离测试通过 |
| ACS-02 | 原生槽位投影＋Others＋原生恢复；手工／静态小集合用于验证 | 行为学习、语义调用 | 可逆性、原生导航、Project／Search 无回归 |
| ACS-03 | 有界候选、合格活动、直接行为边、行为-only 基线 | AI、聚类、全历史 | 无自动全量扫描；来源／反馈偏差测试通过 |
| ACS-04 | 稳定性、冷启动、两项纠错、双层 cache、multi-tab late-result guard | 正式模型外发 | 抖动、定向规则、lease、竞争与清除测试通过 |
| ACS-05 | 有界 evidence extractor、正文归属、同意 UI、本机 helper、API schema／预算契约；默认外发关闭 | 大量真实数据调用、自动开启 AI | 数据最小化、密钥隔离、拒绝／超时和预算测试通过 |
| ACS-06 | Luna 语义＋有界 Terra escalation；边界 fixture；离线／限额降级与安全回归 | 用户批量标注、AI 自动建类 | 语义通路真实可用，来源与缓存正确，未证明的效果不宣传 |
| ACS-07 | 少量用户判断与真实工作交叉试验、范围完整审计、发布／默认 AI 决策 | 偷加功能、调测试集凑通过 | 技术门槛与产品门槛分别给 PASS／FAIL／INCONCLUSIVE |

ACS-00 的报告必须包括：测试 Chrome／ChatGPT surface 日期与配置、支持路由、身份来源、scope 证据、原生受保护区域、虚拟化风险、恢复演示、残留测试、已知不支持场景。只贴截图不够；也不能只在静态 HTML fixture 里成功就宣称真实站点通过。

开发执行协议：每次明确只执行一轮；开始前重新核验新项目远端 HEAD、canonical status 和本轮门槛；完成后提交证据并停止；下一轮需单独执行指令。所谓 COMPLETE 必须同时有实现／文档提交与该轮 required checks 通过，不能只改状态文字。

未来 required checks 至少覆盖类型／lint、领域单测、存储与状态机集成、adapter fixture、隐私／权限断言；真实站点 smoke 与人工体验属于另行记录的 gate，不冒充已经由普通 CI 自动覆盖。

## 38. Go / no-go gates｜推进与停止门槛

| Gate | GO 条件 | NO-GO／暂停条件 |
|---|---|---|
| G0：原生载体 | 真实页面存在可隔离槽位；Others 与故障恢复可靠 | 只能靠私有 API，或必须重写整个 sidebar／改右侧面板 |
| G1：身份／scope | 受支持场景无误绑、无跨账号缓存投影 | 账号边界不可验证却仍需重放旧标题／摘录 |
| G2：原生不干预 | Projects／Search／New Chat／原生操作回归通过 | 隐藏或移动保护节点；影响原生数据行为 |
| G3：可预测性 | 内部切换保位，人工规则稳定，多 Tab 不串线 | 持续抖动、旧异步结果误绘制、人工 exclude 被重加 |
| G4：隐私／成本 | 明确同意、key 隔离、可清除、预算有效 | 草稿／全历史外发、key 进入页面、未知费用仍无限请求 |
| G5：产品价值 | 可比任务切换成本下降，用户愿意持续开启 | 更快的算法却让用户更迷失或更依赖恢复原生 |
| G6：AI 增益 | 相对行为基线有净收益 | 只提高表面语义一致性，或收益不抵配置／纠错成本 |

建议 ACS-00 至少覆盖 200 次组合导航、20 次人为 DOM／连接故障注入、10 次恢复／禁用／更新相关场景，并测试三个并行 ChatGPT Tab。这些是工程门槛，不是统计证明的 99.9% 可靠性。身份错绑、跨 scope 展示、Project 写入出现一次即失败，不能平均成高通过率。

如果 scope 能力不足但单账号受控原型有价值，只能标明 PRIVATE_SPIKE，不得跳过安全 gate 给正式 GO。若技术通过但用户试验不足，则状态为 PILOT_READY 或 INCONCLUSIVE，不叫正式成功。

## 39. Highest-risk unknowns｜高风险未知与对需求的挑战

| 假设／未知 | 真实风险 | 本设计的判断与验证 |
|---|---|---|
| 打开 Chat 就改列表一定更好 | 位置记忆破坏，鼠标目标移动 | anchor 即时变化，列表有惯性；单独测 spatial churn |
| Others 足以防迷失 | 折叠会让用户误以为记录消失 | 恢复原生、不报伪总数；缺项与正常换工作分开测 |
| anchor 比 Workspace 更好 | 某些用户确实需要命名／固定工作区 | 对此需求先选 anchor；不能据此声称普遍优于 Workspace |
| 必須语义才能相关 | 行为可能已解决多数问题 | 保留行为基线，AI 需通过增益 gate |
| 3～8 是正确数量 | 不同任务规模不同；硬限伤害用户 | 自动目标6／上限8是初始值，人工保护可超出，不凑满 |
| DOM 增强可以长期维护 | 宿主更新／A-B 实验随时打破假设 | adapter 版本、能力检测、fail-open；没有可控槽位即停止 |
| 只过滤原生行就够 | 未渲染候选无法出现，顺序不受控 | 原位 projection，但必须验收原生操作路径的让步 |
| 可获取稳定 conversation identity | 新 Chat 过渡、Project 路由、重复标题 | URL 证据＋epoch；未知不猜；正文归属独立验证 |
| 账号一定好区分 | 可见 UI 不一定含可靠唯一身份 | scope 是核心 gate，不能靠 display name 假装隔离 |
| 自动衰减只是自然演化 | 用户感到昨天的 Chat 消失 | 只在安全边界移出视图，原生可达、人工保留不衰减 |
| 行为越学越准 | 推荐影响点击，形成自证反馈环 | 折扣推荐点击；保留独立任务／输入证据；不主动随机探索 |
| 一条富 prompt 足够 | 长模板、附件指代可能造成假确信 | 看证据可解释性而非长度，unknown 不升级猜测 |
| AI 接入近乎零门槛 | 本机 helper／API 费用损害安装转化 | 诚实披露；默认行为可用；托管代理不在本轮偷加 |
| 图即可处理跨任务 hub | 监管 Chat 连接多个任务，可能“跳上下文” | graph＋Tab 连续性，不聚类、不传播邻居并集 |

竞品差异仅作可验证范围内的定位。Superpower 的官方页面强调嵌套文件夹、批量整理、搜索、笔记等；原 Easy Folders 域名此次跳转到 Sortbase，其公开主张包括跨平台文件夹、提示词库和搜索。[S17][S18] ACS 的预期差异是“无需建类、由当前 Chat 和近期实际工作自动决定可见邻域”，不是“第一次在 ChatGPT 做侧栏”。没有做穷尽市场测试，不能宣称绝无同类，也不能从宣传页未提到某能力推断竞品一定不支持。

最大的技术未知不是模型是否足够聪明，而是：能否在用户当前真实页面上以可靠 scope 和 reversible slot 持续安全运行。最大的产品未知是：用户是否愿意用动态列表换取更低的搜索成本。两者都必须实测，不能靠架构篇幅解决。

## 40. Frozen invariants｜冻结不变量

| ID | 不变量 |
|---|---|
| F01 | Chat 是 anchor；不要求用户创建、命名或切换 Workspace |
| F02 | Working Set 是视图元数据，不拥有／移动／删除 ChatGPT 聊天 |
| F03 | 原生 Projects、Search、New Chat 和非普通列表表面受到保护 |
| F04 | 主体验必须发生在原生普通列表槽位；不以另一面板冒充成功 |
| F05 | Others 恢复原生浏览能力；扩展不宣称拥有完整历史 |
| F06 | 自动候选有界；不扫描全历史，不因导航全对全调用模型 |
| F07 | 每个自动成员需直接关系或有界继承；禁止传递性归类 |
| F08 | 显式 include／exclude 定向、可追溯、不衰减、优先于行为和 AI |
| F09 | 稳定真实行为优先于较低层的 AI 推断；未知不是否定 |
| F10 | anchor 更新不强迫列表重排；成员及位置遵守稳定性约束 |
| F11 | 每 Tab 独立运行；其他 Tab 学到的关系不直接覆盖当前视图 |
| F12 | AI／网络不进入导航同步路径；失败仍可用原生或本地行为模式 |
| F13 | 只用公开页面证据与正式 API；禁止私有端点、认证截取、React 隐状态 |
| F14 | 未证实 scope／身份／正文归属时不猜、不复用不安全缓存、不外发 |
| F15 | 默认不取 assistant reply、不取草稿、不读附件、不默发全文 |
| F16 | EvidencePacket 有来源、覆盖、版本、hash 与明确的缺口 |
| F17 | API key 不进入网页、内容脚本、扩展普通存储或源码 |
| F18 | 云语义单独授权；清除／撤权之后旧异步结果不得让数据复活 |
| F19 | 凭证、金额预算、存储写入和人工规则不能依靠常驻 worker 正确性 |
| F20 | Adapter 失效先恢复原生；无安全原生槽位则 NO-GO |
| F21 | PAIA Topic 不等于 Working Set；V0.1 独立于 PAIA 主线 |
| F22 | 3～8 是自动集合初始体验目标，不是覆盖用户人工决定的硬法则 |
| F23 | 模型、性能、适配能力和产品收益未经测试不得宣称已验证 |
| F24 | 每轮有真实证据与明确停止点；设计冻结本身不是实施授权 |

---

## 附录 A：初始策略参数总表

此表用于实现核对，不允许各模块自行另造默认值。更改需提升 policyVersion 并记录回归。

| 参数 | 初始值 |
|---|---|
| automatic candidate cap | 64 |
| recent activity window / cap | 10 天 / 40 |
| distinct MRU cap / max observation age | 32 / 45 天 |
| current-session candidates | 8 |
| rendered cold-start seeds | 12 |
| automatic visible target / maximum | 6 / 8，包含 anchor，额外保护项另计 |
| qualified foreground visit | 10 秒或确认已发送 user input |
| rapid-bounce cutoff | <3 秒，不作关系正例 |
| session inactivity gap | 30 分钟 |
| stable behavior minimum | 3 episodes、2 sessions、至少1独立依据 |
| ACS-origin navigation learning weight | 0.25 |
| behavioral / recency half-life | 14 天 / 5 天 |
| promotion / maintenance / replacement gap | 0.72 / 0.50 / 0.12 |
| minimum residency / inherited lease | 120 秒 / 120 秒，不链式续期 |
| automatic commit cooldown | 60 秒 |
| same-anchor automatic replacement cap | 1 个 / 5 分钟 |
| additional score EMA | 不启用；使用衰减聚合＋hysteresis＋提交节流 |
| cache soft TTL / auto reuse hard age | 10 分钟 / 24 小时 |
| per-chat evidence cap | 800 tokens |
| per-request input / output cap | 6,000 / 1,200 tokens（含适用计费输出） |
| per-request candidate maximum | 6，token 预算优先 |
| semantic debounce / anchor refresh interval | 30 秒 / 5 分钟 |
| semantic concurrency / logical timeout | 1 per scope / 20 秒 |
| Luna / Terra daily request caps | 20 / 1，金额预算优先 |
| local budget | $0.10／日、$3／月；不约束同 key 的其他应用 |
| automatic cache / adjacency cap | 128 anchors / 32 edges per anchor |
| raw activity / aggregate retention | 14 天 / 90 天 |
| inactive evidence cleanup | 离开活跃范围14天 |
| automatic ref cap / retention | 2,000 / 180 天，人工规则引用除外 |
| auto-data storage target | ≤25MB |
| consecutive adapter failure latch | 3 次 |

人工规则没有被这些自动上限隐式删除的许可。时钟异常时不批量清除或将负年龄计成超高活跃；重新建立安全时间基准并保留当前可恢复视图。日／月预算使用明确记录的本地计费窗口；修改时区或系统时间不能重复获得预算。

## 附录 B：实现前必须满足的最小反例

| 反例 | 必须得到的结果 |
|---|---|
| A 为代码开发，B 为同主题求职；只有大量“AI”共有词 | 不因 topic_only 自动同屏 |
| A 为 ANS、B 为监管；多 session 真实往返，模型判不同主题 | 可信行为保留 B |
| A 排除 B，B 后来与 A 语义更接近 | B 不被加回 A |
| A 包含 B，B 不需要 A | 不自动写 B→A |
| A–B、B–C、C–D 组成长链 | 打开 A 不得到整个连通分量 |
| 同一监管 Chat 从 ANS Tab 与 SEM Tab 打开 | 两个 Tab 可保持不同前序工作环境 |
| 切到 B 后 A 的模型响应到达 | 不改变 B 的界面 |
| A 的文本已清除，但旧请求成功返回 | 不复活文本或关系 |
| URL 变成 B，页面还显示 A 的正文 | 不把 A 输入写入 B |
| 新 Chat 只有“帮我看这个附件” | 不凭长度／标题强分类，不偷偷读附件 |
| 一条新 prompt 明确开始独立论文任务 | 可提前成熟，在安全边界换邻域 |
| 活跃集合8个，用户额外保留第9个 | 保留第9个，不自动撤销用户决定 |
| 长期旧 Chat 从原生搜索打开 | 作为新 anchor 重新进入，不先整理全部历史 |
| 普通列表只挂载部分聊天 | Others 不报“完整其他聊天总数” |
| Project 区域被宿主嵌入普通区域 | 保护检查失败，恢复原生，不扩大隐藏 |
| 隐藏普通列表造成加载哨兵无限触发 | R0 不通过，不把请求风暴当预加载 |
| 账号从甲切到乙且无法验证 scope | 不显示甲的缓存标题／摘录，回原生 |
| worker 在写人工规则／预算时被终止 | 事务与重读保证不伪报成功、不重复付款 |
| 模型返回合法 JSON 但引用了未知 Chat | 验证拒绝，不凭模型创建新身份 |
| Others 打开后用户只在滚动 | 保持原生浏览，不自动折回 |

## 附录 C：来源与核验记录

访问核验日期均为 2026-09-19；网页会继续变化。以下 URL 作为资料定位，不表示宿主为第三方 DOM 改造提供了支持承诺。平台事实的摘要与本文件原创设计决定已在正文区分。

[S01] OpenAI Developers，Add UI to your MCP server；原 Apps SDK 页面现重定向至 Plugins 文档。  
`https://developers.openai.com/plugins/build/chatgpt-ui`

[S02] Chrome for Developers，Content scripts。  
`https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts`

[S03] Chrome for Developers，webNavigation API；包括 history-state events、documentId、BFCache 提醒。  
`https://developer.chrome.com/docs/extensions/reference/api/webNavigation`

[S04] Chrome for Developers，The extension service worker lifecycle。  
`https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle`

[S05] Chrome for Developers，Storage API。  
`https://developer.chrome.com/docs/extensions/reference/api/storage`

[S06] Chrome for Developers，Native messaging。  
`https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging`

[S07] OpenAI Help Center，Best Practices for API Key Safety。  
`https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety`

[S08] OpenAI API，GPT-5.6 Luna Model。  
`https://developers.openai.com/api/docs/models/gpt-5.6-luna`

[S09] OpenAI API，GPT-5.6 Terra Model。  
`https://developers.openai.com/api/docs/models/gpt-5.6-terra`

[S10] OpenAI API，Pricing；采用 Standard 短上下文输入／输出价格，并单列 cache-write 保守计算。  
`https://developers.openai.com/api/docs/pricing`

[S11] OpenAI API，Structured model outputs。  
`https://developers.openai.com/api/docs/guides/structured-outputs`

[S12] OpenAI API，Data controls in the OpenAI platform。  
`https://developers.openai.com/api/docs/guides/your-data`

[S13] OpenAI Help Center，Finding your chats, projects, and files in ChatGPT。  
`https://help.openai.com/en/articles/10056348-how-do-i-search-my-chat-history-in-chatgpt`

[S14] OpenAI Help Center，Projects in ChatGPT。  
`https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt`

[S15] Chrome Web Store，Updated Privacy Policy & Secure Handling Requirements。  
`https://developer.chrome.com/docs/webstore/program-policies/user-data-faq`

[S16] Chrome Web Store，Limited Use。  
`https://developer.chrome.com/docs/webstore/program-policies/limited-use`

[S17] Superpower 官方产品介绍；仅用于说明其公开强调的能力，不作穷尽竞品审计。  
`https://superpowerdaily.com/superpower-chatgpt`

[S18] Sortbase 官方主页；本次从原 Easy Folders 域名跳转到此。  
`https://sortbase.ai/`

需求依据：用户上传的《粘贴的 markdown (1)。md(20260919-062951)》，939 行，尤其是 chat-first／Working Set、native sidebar、API 边界、PAIA 边界与最终交付要求。本文件是本次设计交付；需求附件不是已经实现或实测成功的证据。

---

**最终决策：先证明原生槽位、公开身份、scope 隔离与可逆恢复；再证明行为邻域减少找聊天的成本；最后证明语义模型提供净增益。三件事不得倒序，也不得相互冒充。**