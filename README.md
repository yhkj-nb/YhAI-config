<div align="center">

# 🧩 云痕AI配置工具

> 纯前端 · 零依赖 · 可离线运行的「AI 供应商配置管理 + 可用性检测」工具

![Version](https://img.shields.io/badge/version-V4-blueviolet)
![Pure Frontend](https://img.shields.io/badge/frontend-pure%20static-blue)
![Zero Build](https://img.shields.io/badge/build-zero%20config-brightgreen)
![Zero Dependency](https://img.shields.io/badge/dependencies-zero-blue)
![Offline Ready](https://img.shields.io/badge/offline-ready-orange)
![Local Only](https://img.shields.io/badge/privacy-100%25%20local-red)
![Providers](https://img.shields.io/badge/providers-20%2B-informational)
![WebCat](https://img.shields.io/badge/adapt-WebCat-important)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

![GitHub stars](https://img.shields.io/github/stars/yhkj-nb/YHAI-config?style=social)
![GitHub forks](https://img.shields.io/github/forks/yhkj-nb/YHAI-config?style=social)
![GitHub issues](https://img.shields.io/github/issues/yhkj-nb/YHAI-config)
![GitHub last commit](https://img.shields.io/github/last-commit/yhkj-nb/YHAI-config)
![License](https://img.shields.io/badge/license-unspecified-lightgrey)

</div>

`纯前端` `零构建` `两文件结构` `数据不出浏览器` 
## 📌 项目简介

**云痕AI 配置工具** 是一个纯前端、零依赖、可离线运行的「AI 供应商配置管理 + 可用性检测」工具。

它的核心流程只有三步：

```
┌───────────────┐    ┌──────────────────────┐    ┌────────────────────────────┐
│  填写配置      │ →  │  测试真实可用性       │ →  │ 生成分享串 / 二维码 / JSON  │
│  type / name  │    │  /models + 对话探测   │    │ 数据全程留在浏览器内        │
│  apiKey/baseUrl│   │ 只有 HTTP 200 才算可用 │    │ 可解析回填、可批量迁移      │
└───────────────┘    └──────────────────────┘    └────────────────────────────┘
```

整条链路上**没有后端参与**：不需要服务器、不需要账号、不需要上传 API Key。配置填写、真实可用性测试、分享串编解码、二维码生成与解码、JSON 导入导出、cURL 生成，全部在浏览器内完成。

### 设计取向

| 取向 | 具体表现 |
| --- | --- |
| 🪶 极简部署 | 两文件结构，直接双击 `index.html` 即可运行，不需要 npm / 打包工具 |
| 🔒 数据自持 | 全程数据不离开浏览器 |
| 🧩 契约稳定 | 分享串格式固定为 `ai-provider:v1:...`，旧分享串必须永远能被新代码解析 |
| 🎯 结果可信 | 「可用」的唯一标准是真实对话请求返回 HTTP 200，而不是只看 Key 能不能鉴权通过 |
| 🖱️ 低操作成本 | 主操作前置 + 高级选项折叠，常用路径一到两次点击即可完成 |

---

## ✨ 核心能力

1. **20+ 供应商适配器** —— OpenAI / Anthropic / Google / DeepSeek / Qwen / Moonshot / Zhipu / Mistral / Ollama / OpenRouter / SiliconFlow / Groq / Together / Fireworks / Perplexity / Cohere / xAI / GitHub Models / Azure OpenAI / 自定义
2. **真实可用性检测** —— 先拉 `/models`，再对最多 3 个候选模型发 `max_tokens=1` 的对话请求，**只有 HTTP 200 才算可用**
3. **状态细分** —— `ok` / `auth-fail` / `rate-limit` / `quota(402)` / `model-not-found(404)` / `param-error(422)` / `cors-or-net` / `chat-fail` / `models-ok` / `partial` / `skipped`
4. **多代理可选** —— 直连 / corsproxy.io / allorigins.win / codetabs.com / 自定义模板（`{url}` 占位符），带**代理故障识别**（避免把代理挂了误判成 API Key 鉴权失败）
5. **分享串** —— 生成 / 解析 / 多行混合文本提取 / 分享链接（`#provider=...`）/ `stripKey`（移除 API Key 后分享）
6. **二维码** —— 内置 qrcode-generator 生成 + 下载 PNG + 复制图片；内置 jsQR 解码（上传 / 拖拽 / `Ctrl+V` 粘贴）
7. **JSON 导入导出** —— 批量迁移配置，含 `extra` 字段
8. **cURL 一键复制** —— 含代理地址、header、body，单引号转义正确
9. **Azure api-version 可配置** —— 表单输入 → 只用于测试链路，**不写入分享串**
10. **Perplexity 白名单** —— 不提供 `/models`，自动跳过模型列表阶段
11. **混合内容检测** —— HTTPS 页面请求 HTTP 端点时提前拦截
12. **端点预览** —— 实时展示模型端点 / 对话端点，自动处理路径去重
13. **UI/UX** —— 三步 stepper、主操作前置 + 高级选项折叠、全局唯一「网络方式」/「真实对话检测」下拉（两 Tab 共用、localStorage 记忆）、卡片状态点、卡片「⋯」更多菜单、结果卡片详情折叠（错误状态默认展开）、空状态 CTA、键盘快捷键、toast 队列化、复制反馈「✓ 已复制」、进度文案「测试中 2/5…」、清空列表二次确认、帮助模态（自动填充状态对照表）
14. **图标方案** —— 彻底移除 Font Awesome CDN，改用**内联 SVG sprite**

---

## 🧱 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 结构 / 样式 / 图标 / 内联库 | `index.html` | 页面结构 + CSS + SVG sprite + 内联第三方库 + 引入 `app.js` |
| 全部逻辑 | `app.js` | 工具、适配器、网络、核心流程、二维码、渲染、事件绑定 |
| 图标 | 内联 SVG sprite（约 45 个） | 用法 `<svg class="icon"><use href="#i-xxx"/></svg>`；`app.js` 中 `Utils.iconSvg('fa-xxx')` 自动映射到 `#i-xxx` |
| 二维码生成 | 内联 qrcode-generator | 离线可用 |
| 二维码解码 | jsQR | 目前 CDN 兜底（见「已知待办」） |
| 构建工具 | 无 | 不需要 npm / 打包工具 |
| 运行方式 | 直接双击 `index.html` | 可离线运行 |

```
目录结构：
.
├── index.html      ← 结构 + CSS + SVG sprite + 内联第三方库 + 引入 app.js
├── app.js          ← 全部逻辑（7 大模块）
```

---

## 📜 数据契约（不可更改）

> ⚠️ 本节是硬契约。任何改动都会破坏与历史数据、以及与 Dart/Flutter 端解码器的兼容性。

### 分享串格式

```
ai-provider:v1:<Base64URL(JSON)>
```

### JSON 顶层键

```json
{ "type": "", "name": "", "apiKey": "", "baseUrl": "" }
```

### 规则

| # | 规则 | 说明 |
| --- | --- | --- |
| 1 | **未知字段原样保留在 `extra` 中** | 解析时不丢弃、不重排未知字段；再次生成时原样带回 |
| 2 | **Base64URL 必须保留 `=` 补位** | 兼容 Dart/Flutter 严格解码器，不做「去补位」优化 |
| 3 | **旧分享串必须永远能被新代码解析** | 向后兼容优先级最高，格式只增不改 |

### 生成 / 解析链路

```
生成：
  { type, name, apiKey, baseUrl, ...extra }
      → JSON.stringify
      → Base64URL（保留 = 补位）
      → ai-provider:v1:xxxxxxxx

解析：
  ai-provider:v1:xxxxxxxx
      → Base64URL 解码
      → JSON.parse
      → type / name / apiKey / baseUrl 四个标准键 + 其余字段进入 extra
```

---

## 🖥️ 界面结构

```
┌──────────────────────────────────────────────────────────────┐
│  品牌标题                                      [ 帮助 ? ]    │
├──────────────────────────────────────────────────────────────┤
│  ① 填写配置  ──→  ② 测试连通  ──→  ③ 分享 / 导入            │
│                 （三步 stepper）                             │
├──────────────────────────────────────────────────────────────┤
│  全局工具条（两 Tab 共用，localStorage 记忆）                 │
│  ┌ 网络方式 ▾ ┐   ┌ 真实对话检测 ▾ ┐                         │
│  │ 直连 / 代理 │   │ 开 / 关        │                         │
│  └────────────┘   └───────────────┘                         │
├──────────────────────────────────────────────────────────────┤
│  [ 生成分享串 ]        [ 解析 / 导入 ]      ← 两个 Tab        │
├──────────────────────────────────────────────────────────────┤
│  主操作（前置）                                              │
│  ▸ 高级选项（折叠：代理模板、Azure api-version 等）          │
│                                                              │
│  端点预览：模型端点 ……… / 对话端点 ………（自动路径去重）      │
│                                                              │
│  ┌ 供应商卡片 ───────────────────────────────────────────┐   │
│  │ ● 状态点   name              [ 眼睛 ]  [ ⋯ 更多 ]      │   │
│  │   baseUrl / apiKey（掩码）                             │   │
│  │   ┌ 结果卡片（详情可折叠，错误状态默认展开） ┐         │   │
│  │   └───────────────────────────────────────────┘        │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  空状态： [ 去粘贴 ]   [ 扫描二维码 ]   [ 导入 JSON ]        │
└──────────────────────────────────────────────────────────────┘

浮层：toast（队列化） · 帮助模态（自动填充状态对照表）
```

| 区域 | 组成与作用 |
| --- | --- |
| 三步 stepper | 填写配置 → 测试连通 → 分享 / 导入，当前步骤由 `trackStep` 跟踪 |
| 全局工具条 | 全局唯一的「网络方式」「真实对话检测」下拉，两 Tab 共用，`localStorage` 记忆 |
| 生成 Tab | 主操作前置、高级选项折叠、端点预览、供应商卡片列表、结果卡片 |
| 解析 Tab | 多行混合文本提取、分享串解析、分享链接解析、二维码解码、JSON 导入导出 |
| 卡片状态点 | 未测试 / 测试中 / 可用 / 失败 |
| 卡片操作 | 眼睛按钮（显隐 API Key，局部更新）、「⋯」更多菜单 |
| 空状态 CTA | 去粘贴 / 扫描二维码 / 导入 JSON |
| 浮层 | toast 队列、帮助模态 |

---

## 🔍 功能详解

### 1️⃣ 供应商适配器（Adapters）

内置 20+ 供应商适配器，把「供应商差异」收敛为一份统一配置：`type` / `name` / `apiKey` / `baseUrl`。未覆盖到的供应商走 `自定义` 通道，端点路径由用户自行填写。

适配器提供的能力：

| 能力 | 作用 |
| --- | --- |
| `get(type)` | 取某供应商的默认配置 |
| `detectProvider(type)` | 供应商识别 / 归类 |
| `BASE_DEFAULTS` | 各供应商的基础默认值 |
| `extractIds(...)` | 从 `/models` 响应中提取候选模型 ID |
| `NO_MODELS_ENDPOINT` | 声明「不提供 `/models`」的供应商名单 |
| `needsModelsSkip(type)` | 判断是否可以跳过模型列表阶段 |

### 2️⃣ 真实可用性检测（两阶段）

「能拉到模型列表」不等于「能对话」。因此检测拆成两阶段，**只有对话请求返回 HTTP 200 才算可用**。

```
                     ┌────────────────────────────┐
  输入配置 ────────► │ 阶段一：GET /models        │
                     └─────────────┬──────────────┘
                                   │
              ┌────────────────────┴─────────────────────┐
       拉取成功 │                                    失败 │
              ▼                                          ▼
  ┌───────────────────────────┐        ┌─────────────────────────────────┐
  │ extractIds 提取候选模型 ID │        │ 分类：auth-fail / rate-limit    │
  │ 最多取 3 个候选模型        │        │ quota(402) / model-not-found    │
  └─────────────┬─────────────┘        │ (404) / cors-or-net             │
                │                      │ （looksLikeProxyFailure 先排误判）│
                ▼                      └───────────────┬─────────────────┘
  ┌────────────────────────────────┐                   │
  │ 阶段二：对候选模型发对话请求   │                   │
  │ max_tokens = 1                 │                   │
  └─────────────┬──────────────────┘                   │
                │                                      │
      ┌─────────┴───────────┐                          │
  HTTP 200               非 200                        │
      ▼                     ▼                          ▼
   ✅ ok             chat-fail / param-error(422)   最终状态
                     / rate-limit / quota(402) …
```

> `Perplexity` 因不提供 `/models`，会被白名单直接跳过阶段一，进入对话探测（状态可能呈现为 `skipped` / `partial` 等）。

### 3️⃣ 状态语义细分

不再是「成功 / 失败」二元，而是细分到可行动的程度，完整定义见「状态语义对照表」。

### 4️⃣ 多代理可选

| 选项 | 说明 |
| --- | --- |
| 直连 | 不带代理，直接请求目标端点 |
| corsproxy.io | 公共 CORS 代理 |
| allorigins.win | 公共 CORS 代理 |
| codetabs.com | 公共 CORS 代理 |
| 自定义模板 | 用 `{url}` 占位符填写自己的代理地址 |

关键细节：**代理故障识别**（`looksLikeProxyFailure`）会在判定前先识别「是不是代理本身挂了」，避免把代理故障误判成 API Key 鉴权失败，误导用户去换 Key。

### 5️⃣ 分享串

| 能力 | 说明 |
| --- | --- |
| 生成 | 配置 → `ai-provider:v1:<Base64URL(JSON)>` |
| 解析 | 支持单条解析，也支持从**多行混合文本**中批量提取分享串 |
| 分享链接 | 以 `#provider=...` 形式拼进 URL，打开页面自动解析回填，含 `hashchange` 去重 |
| `stripKey` | 移除 API Key 后再分享，并给出分享告警提示 |

### 6️⃣ 二维码

| 方向 | 能力 |
| --- | --- |
| 生成 | 内置 qrcode-generator，可直接下载 PNG、复制图片到剪贴板 |
| 解码 | 内置 jsQR，支持上传图片 / 拖拽文件 / `Ctrl+V` 粘贴图片 |

生成链路完全离线；解码库目前走 CDN 兜底。

### 7️⃣ JSON 导入导出

用于批量迁移配置。导出内容包含 `extra` 字段，保证未知字段不丢；导入时按数据契约还原。

### 8️⃣ cURL 一键复制

按当前配置生成可直接在终端执行的 cURL 命令：

- 包含代理地址（选择了代理时）
- 包含完整 header
- 包含请求 body
- **单引号转义正确**，复制即可运行

### 9️⃣ Azure api-version 可配置

Azure OpenAI 的 `api-version` 由表单输入，**只用于测试链路**，不会写入分享串 —— 分享串结构始终保持四个标准键不变。

### 🔟 Perplexity 白名单

Perplexity 不提供 `/models`，因此被列入白名单自动跳过模型列表阶段，不会因为「拉不到模型」而被误判为失败。

### 1️⃣1️⃣ 混合内容检测

当页面是 HTTPS、而目标端点是 HTTP 时，浏览器会直接拦截请求。工具会**提前拦截并给出明确提示**（`checkMixedContent`），而不是让用户面对一个莫名的失败。

### 1️⃣2️⃣ 端点预览

实时展示本次将要请求的两个端点：

- 模型端点（`/models`）
- 对话端点（chat）

并**自动处理路径去重**（`joinUrl`），避免出现 `/v1/v1/...` 这类拼接错误。

### 1️⃣3️⃣ UI/UX 细节

- 三步 stepper：填写配置 → 测试连通 → 分享 / 导入
- 主操作前置 + 高级选项折叠
- 全局唯一「网络方式」/「真实对话检测」下拉，两 Tab 共用，`localStorage` 记忆
- 卡片状态点：未测试 / 测试中 / 可用 / 失败
- 卡片「⋯」更多菜单
- 结果卡片详情折叠（错误状态默认展开）
- 空状态 CTA：去粘贴 / 扫描二维码 / 导入 JSON
- 键盘快捷键：`Ctrl/Cmd+Enter`、`Ctrl/Cmd+K`、`Esc`
- toast 队列化；复制反馈「✓ 已复制」；进度文案「测试中 2/5…」
- 清空列表二次确认
- 帮助模态：自动填充状态对照表

### 1️⃣4️⃣ 图标方案

彻底移除 Font Awesome CDN，改为**内联 SVG sprite**（约 45 个图标）：

```
用法：   <svg class="icon"><use href="#i-xxx"/></svg>
JS 侧：  Utils.iconSvg('fa-xxx')  →  自动映射到 #i-xxx
收益：   无外链请求、离线可用、颜色随 currentColor、体积可控
```

---

## 📊 供应商适配矩阵

| # | 供应商 | 模型列表阶段 | 对话探测 | 备注 |
| --- | --- | --- | --- | --- |
| 1 | OpenAI | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 2 | Anthropic | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 3 | Google | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 4 | DeepSeek | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 5 | Qwen | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 6 | Moonshot | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 7 | Zhipu | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 8 | Mistral | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 9 | Ollama | 拉取 `/models` | `max_tokens=1` | 本地部署常用 |
| 10 | OpenRouter | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 11 | SiliconFlow | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 12 | Groq | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 13 | Together | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 14 | Fireworks | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 15 | Perplexity | **跳过**（白名单） | `max_tokens=1` | 不提供 `/models`，自动跳过阶段一 |
| 16 | Cohere | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 17 | xAI | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 18 | GitHub Models | 拉取 `/models` | `max_tokens=1` | 标准两阶段流程 |
| 19 | Azure OpenAI | 拉取 `/models` | `max_tokens=1` | `api-version` 可配置，只用于测试链路，不写入分享串 |
| 20 | 自定义 | 取决于端点 | `max_tokens=1` | 端点与路径由用户填写 |

> 统一检测规则：候选模型最多取 3 个，对话请求使用 `max_tokens=1`，**只有 HTTP 200 才算可用**。

---

## 🚦 状态语义对照表

| 状态 | 语义 | 典型触发 | 卡片状态点 |
| --- | --- | --- | --- |
| `ok` | 真实对话成功 | 对话请求返回 **HTTP 200** | 🟢 可用 |
| `auth-fail` | 鉴权失败 | 鉴权被服务端拒绝（需先排除代理故障） | 🔴 失败 |
| `rate-limit` | 触发限流 | 被服务端限流 | 🔴 失败 |
| `quota(402)` | 额度 / 计费问题 | HTTP 402 | 🔴 失败 |
| `model-not-found(404)` | 模型不存在 / 路径不对 | HTTP 404 | 🔴 失败 |
| `param-error(422)` | 请求参数不合法 | HTTP 422 | 🔴 失败 |
| `cors-or-net` | 跨域或网络层失败 | CORS 被拦、网络不可达、HTTPS→HTTP 混合内容 | 🔴 失败 |
| `chat-fail` | 对话探测失败 | 非 200，且无法归入更细分类 | 🔴 失败 |
| `models-ok` | 模型列表成功，但未达成「可用」结论 | `/models` 通过，尚未拿到 HTTP 200 的对话结果 | 🟡 部分 |
| `partial` | 部分成功 | 候选模型中仅部分成功 / 阶段仅部分通过 | 🟡 部分 |
| `skipped` | 某阶段被跳过 | 例如 Perplexity 白名单跳过 `/models` | ⚪ 未完成 |

> 判定原则：`ok` 的语义被严格收窄为「对话请求 HTTP 200」，不再把「`/models` 能通」当成可用。

---

## ⌨️ 键盘快捷键

| 快捷键 | 作用 |
| --- | --- |
| `Ctrl/Cmd + Enter` | 触发当前主流程动作（主操作） |
| `Ctrl/Cmd + K` | 打开快速入口（聚焦定位） |
| `Esc` | 关闭当前浮层（模态 / 菜单） |

---

## 🧭 代码结构（`app.js` 七大模块）

| # | 模块 | 职责 |
| --- | --- | --- |
| 1 | **Utils** | 通用工具函数集合 |
| 2 | **Adapters** | 供应商适配器与差异收敛 |
| 3 | **Net** | 网络请求与代理层 |
| 4 | **Core** | 核心业务：分享串、检测流程、cURL |
| 5 | **Qr** | 二维码生成、绘制、下载、解码 |
| 6 | **Render** | 状态元信息与全部渲染逻辑 |
| 7 | **事件绑定** | 全局交互、快捷键、帮助模态、hash 路由 |

### 1. Utils —— 通用工具

| 成员 | 说明 |
| --- | --- |
| `$` | 选择器快捷方法 |
| `iconSvg` | `iconSvg('fa-xxx')` → 映射为 `#i-xxx` 的内联 SVG |
| `showToast` | toast 队列化提示 |
| `copyText` | 复制并反馈「✓ 已复制」 |
| `escapeHtml` | HTML 转义（XSS 加固） |
| `truncate` | 文本截断 |
| `maskKey` | API Key 掩码显示 |
| `b64Encode` | Base64URL 编码（保留 `=` 补位） |
| `b64Decode` | Base64URL 解码 |
| `joinUrl` | URL 拼接（路径去重） |
| `fmtMs` | 耗时格式化 |
| `uniq` | 数组去重 |
| `checkMixedContent` | HTTPS 页面请求 HTTP 端点的提前拦截 |
| `ls` | localStorage 读写封装（记忆「网络方式」「真实对话检测」等偏好） |

### 2. Adapters —— 供应商适配

| 成员 | 说明 |
| --- | --- |
| `get` | 取指定 type 的适配器配置 |
| `detectProvider` | 供应商识别 |
| `BASE_DEFAULTS` | 基础默认值表 |
| `extractIds` | 从 `/models` 响应中提取模型 ID |
| `NO_MODELS_ENDPOINT` | 不提供 `/models` 的供应商名单 |
| `needsModelsSkip` | 是否需要跳过模型列表阶段 |

### 3. Net —— 网络与代理

| 成员 | 说明 |
| --- | --- |
| `PROXIES` | 代理方案集合（直连 / corsproxy.io / allorigins.win / codetabs.com / 自定义） |
| `request` | 统一请求入口 |
| `buildProxyUrl` | 按 `{url}` 占位符或内置代理生成实际请求地址 |
| `setCustomProxy` | 保存自定义代理模板 |
| `getCustomProxy` | 读取自定义代理模板 |
| `readRaw` | 读取原始响应（保留可诊断信息） |
| `looksLikeProxyFailure` | 代理故障识别，避免误判为鉴权失败 |

### 4. Core —— 核心业务

| 成员 | 说明 |
| --- | --- |
| `buildShareString` | 生成 `ai-provider:v1:<Base64URL>` |
| `parseShareStrings` | 从多行混合文本中批量提取分享串 |
| `parseAny` | 统一解析入口（分享串 / 分享链接 / JSON） |
| `fetchModels` | 阶段一：拉取 `/models` 并提取候选模型 |
| `testChat` | 阶段二：`max_tokens=1` 对话探测 |
| `testProvider` | 串起两阶段，产出最终状态 |
| `buildCurl` | 生成可复制的 cURL 命令 |

### 5. Qr —— 二维码

| 成员 | 说明 |
| --- | --- |
| `build` | 生成二维码矩阵 |
| `draw` | 绘制到画布 |
| `downloadPng` | 下载 PNG |
| `copyImageToClipboard` | 复制图片到剪贴板 |
| `decode` | jsQR 解码 |
| `loadImageFile` | 加载图片文件（上传 / 拖拽 / 粘贴） |

### 6. Render —— 渲染

| 成员 | 说明 |
| --- | --- |
| `STATUS_META` | 状态元信息表（文案、颜色、是否默认展开等） |
| `STAGE_LABEL` | 阶段标签文案 |
| `renderTestResult` | 渲染结果卡片 |
| `renderProviders` | 渲染供应商卡片列表 |
| `toggleKeyVisibility` | 眼睛按钮（局部更新，不整表重绘） |
| `setCardStatus` | 设置卡片状态点 |
| `setBusy` | 忙碌态 |
| `showLoading` | 加载态 |
| `showError` | 错误展示 |
| `modelsBlockHtml` | 模型列表区块 HTML |

### 7. 事件绑定

| 成员 | 说明 |
| --- | --- |
| `trackStep` | 三步 stepper 跟踪 |
| `initGlobalTools` | 初始化全局工具条（网络方式 / 真实对话检测） |
| `bindGenerateTab` | 生成 Tab 事件 |
| `bindParseTab` | 解析 Tab 事件 |
| `bindShortcuts` | 键盘快捷键 |
| `buildHelpTable` | 帮助模态内状态对照表自动填充 |
| `bindHelpModal` | 帮助模态打开 / 关闭 |
| `handleHash` | `#provider=...` 分享链接解析与去重 |

---

## 🚀 使用流程

### 主流程：填写配置 → 测试可用性 → 生成产物

```
① 打开 index.html
   双击即可运行，无需安装任何环境（不需要 npm / 打包工具）
        │
        ▼
② 填写配置
   选择供应商 type → 填入 name / apiKey / baseUrl
   · 高级选项折叠区按需展开：代理模板、Azure api-version
        │
        ▼
③ 端点预览
   真实展示即将请求的：模型端点（/models）+ 对话端点（chat）
   自动路径去重，避免 /v1/v1/... 之类的拼接错误
        │
        ▼
④ 选择全局选项（两 Tab 共用，localStorage 记忆）
   网络方式：直连 / corsproxy.io / allorigins.win / codetabs.com / 自定义模板
   真实对话检测：开 / 关
        │
        ▼
⑤ 测试连通
   · 阶段一：GET /models → 提取最多 3 个候选模型
   · 阶段二：对话请求 max_tokens=1 → 只有 HTTP 200 判为 ok
   · 进度文案：测试中 2/5…       卡片状态点：未测试 → 测试中 → 可用 / 失败
        │
        ├── 失败 → 展开结果卡片详情（错误状态默认展开）
        │          按状态语义定位问题：auth-fail / rate-limit / quota(402) /
        │          model-not-found(404) / param-error(422) / cors-or-net / chat-fail
        │
        ▼
⑥ 生成产物（数据不出浏览器）
   · 分享串：ai-provider:v1:<Base64URL(JSON)>
   · 二维码：下载 PNG / 复制图片
   · 分享链接：#provider=...
   · 可选 stripKey：移除 API Key 后分享（附分享告警）
   · cURL：一键复制（含代理地址、header、body）
```

### 回填流程：别人给的配置怎么进来

```
朋友给你的：一串文本 / 一张二维码 / 一个链接 / 一份 JSON
        │
        ├── 多行混合文本 ────────► parseShareStrings 批量提取 ──┐
        ├── 分享链接 #provider=... ► handleHash（含 hashchange 去重）┤
        ├── 二维码图片 ──────────► 上传 / 拖拽 / Ctrl+V → decode ┤
        └── JSON 文件 ───────────► 导入（保留 extra 字段）──────┤
                                                                ▼
                                              回填为配置卡片，可再次测试
```

### 空状态入口

列表为空时提供三个 CTA：**去粘贴** / **扫描二维码** / **导入 JSON**。

---

## 🔐 安全与隐私

| 关注点 | 现状与做法 |
| --- | --- |
| 数据流向 | 全程数据不离开浏览器；无后端、无账号体系、无上传接口 |
| API Key 存储 | 不依赖服务端保存；仅在页面内使用，`maskKey` 掩码展示，眼睛按钮按需显隐 |
| API Key 分享 | 提供 `stripKey`：移除 API Key 后再生成分享串，并给出分享告警提示 |
| XSS 加固 | 所有动态内容经 `escapeHtml` 转义后渲染（V2 引入） |
| 混合内容 | HTTPS 页面请求 HTTP 端点时提前拦截，避免浏览器静默拦截造成误判 |
| 代理风险 | 使用公共 CORS 代理时请求会经第三方中转；如涉及敏感 Key，建议改用自建代理模板或直连 |
| 误判防护 | `looksLikeProxyFailure` 避免把代理故障当作鉴权失败，减少「换 Key」式的错误处置 |
| 本地偏好 | 仅「网络方式」「真实对话检测」等选项写入 `localStorage`，用于记忆交互偏好 |

> 建议：分享前先确认是否需要保留 API Key；对外分发时优先使用 `stripKey` 后的分享串。

---

## 🕰️ 版本演进

| 版本 | 主要变更 |
| --- | --- |
| **V1** | 基础分享串生成 / 解析 |
| **V2** | 多代理 + `fetchModels` / `testChat` 解耦 + fallback 链 + 眼睛按钮局部更新 + XSS 加固 + b64 padding 修复 + 适配器扩充 + 二维码离线 |
| **V3** | `stripKey` + 分享告警 + JSON 导入导出 + Azure api-version + Perplexity 白名单 + `ok` 语义修正 + 402/404/422 状态细分 + 混合内容 + 端点预览 + cURL + hashchange 去重 |
| **V4** | UI 全面重排（30 处）+ SVG 图标替换 Font Awesome + 拆分为 `index.html` + `app.js` 两文件 |

---

## 📝 已知待办

- `jsQR` 目前 CDN 兜底，若需完全离线需本地化。
- 可能的 V5 方向：
  - IndexedDB 历史记录
  - PWA 离线安装
  - 团队只读视图
  - 批量生成分享串

---

## ❓ FAQ

**Q1：需要安装 Node.js、npm 或任何打包工具吗？**
不需要。项目是纯前端、零构建的两文件结构（`index.html` + `app.js`），直接双击 `index.html` 即可运行。

**Q2：可以完全离线使用吗？**
主体功能可以：图标是内联 SVG sprite，二维码生成使用内联 qrcode-generator，均不依赖外网。唯一例外是二维码**解码**所用的 jsQR 目前走 CDN 兜底，若需完全离线需将其本地化（见「已知待办」）。

**Q3：为什么「模型列表拉到了」却不显示可用？**
因为「能拉到 `/models`」不等于「能对话」。本工具对 `ok` 的定义被严格收窄为：对候选模型发起 `max_tokens=1` 的对话请求并返回 **HTTP 200**。仅 `/models` 通过的情形会体现为 `models-ok` / `partial` 等状态。

**Q4：候选模型为什么最多只测 3 个？**
这是检测策略：从 `/models` 结果中提取模型 ID，最多取 3 个作为候选发起对话探测，在可接受的请求量内验证真实可用性。

**Q5：提示 `auth-fail` 就一定是 Key 错了吗？**
不一定。如果使用了公共 CORS 代理，代理本身故障也可能导致失败。工具内置 `looksLikeProxyFailure` 会先排除代理故障，避免误判成鉴权失败。建议切换到「直连」或换一个代理再测一次。

**Q6：Perplexity 为什么总是跳过模型列表阶段？**
Perplexity 不提供 `/models`，因此被列入 `NO_MODELS_ENDPOINT` 白名单，`needsModelsSkip` 会返回需要跳过，直接进入对话探测阶段。

**Q7：Azure OpenAI 的 api-version 会写进分享串吗？**
不会。`api-version` 由表单输入，**只用于测试链路**，不写入分享串，分享串结构始终保持 `type` / `name` / `apiKey` / `baseUrl` 四个标准键。

**Q8：分享串为什么保留 Base64 的 `=` 补位？**
为了兼容 Dart/Flutter 端的严格解码器。这是数据契约的一部分，不做「去补位」优化。

**Q9：我在分享串里加了自己的字段，会不会丢？**
不会。未知字段会原样保留在 `extra` 中，解析时不丢弃、不重排，再次生成时原样带回。

**Q10：旧的分享串还能用吗？**
能。数据契约要求「旧分享串必须永远能被新代码解析」，向后兼容优先级最高。

**Q11：为什么粘贴一大段聊天记录也能解析出配置？**
解析支持从**多行混合文本**中批量提取分享串（`parseShareStrings`），夹在文字、群聊记录、日志里的分享串也能被识别出来。

**Q12：页面是 HTTPS，但我的端点地址是 HTTP，为什么直接失败？**
这是浏览器的混合内容限制。工具通过 `checkMixedContent` 提前拦截并给出明确提示，避免看起来像「Key 无效」的误判。

**Q13：请求一直失败，怎么排查？**
按这个顺序试：① 看结果卡片的状态语义（错误状态默认展开）；② 切换「网络方式」为直连或换一个代理，排除代理故障；③ 检查端点预览里的模型端点 / 对话端点是否符合供应商要求；④ 用 cURL 一键复制，在终端里复现同样的请求。

**Q14：为什么图标不是 Font Awesome 了？**
V4 起彻底移除 Font Awesome CDN，改用内联 SVG sprite（约 45 个），以便离线可用、无外链请求。`Utils.iconSvg('fa-xxx')` 会自动映射到 `#i-xxx`，旧调用方式无需改动。

**Q15：分享链接长什么样？**
`#provider=` 加分享串，例如 `index.html#provider=ai-provider:v1:...`。打开后 `handleHash` 会自动解析回填，并对 `hashchange` 做去重。

---

## 📄 许可

本项目文档未随附开源许可声明，具体授权与使用条款以项目仓库的实际声明为准。
