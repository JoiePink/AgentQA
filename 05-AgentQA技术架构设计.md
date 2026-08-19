# AgentQA 技术架构设计

## 一、文档目标

本文档定义 AgentQA MVP 的技术架构、模块边界、数据流、运行机制和工程约束，作为项目开发、接口设计和任务拆分的技术依据。

## 二、架构目标

- 使用 Node.js 与 TypeScript 完成前后端和 Agent 核心开发。
- 优先完成单用户、本地运行的 Web 测试闭环。
- 测试过程可观察、可控制、可重跑、可追溯。
- 测试步骤、判断结论和证据之间可以相互对应。
- 模块边界清晰，便于后续扩展小程序测试和服务端部署。

MVP 暂不引入 Docker、Redis、消息队列、多租户、复杂权限和云端并发执行。

## 三、技术选型

| 范围 | 技术 | 用途 |
|---|---|---|
| 前端 | Vue 3、TypeScript、Vite、Element Plus | 页面、任务操作和实时状态展示 |
| 后端 | Node.js、TypeScript、Fastify | API、任务调度和模块协调 |
| Agent | OpenAI Agents SDK、Zod | 计划生成、工具选择和结果判断 |
| 浏览器自动化 | Playwright | 启动 Chrome、操作页面和采集页面状态 |
| 实时通信 | SSE | 推送任务、步骤、日志和虚拟鼠标状态 |
| 数据库 | MySQL、Drizzle ORM | 保存任务、计划、步骤、结果和 Evals |
| 自动化测试 | Vitest | 单元测试和接口测试 |
| 包管理 | pnpm workspace | 管理 Monorepo 中的多个应用和包 |

## 四、项目结构

AgentQA 使用 Monorepo：前端、后端和公共模块放在同一个 Git 仓库中，但代码职责相互分离。

```text
AgentQA/
├─ apps/
│  ├─ web/                    # Vue 前端
│  └─ server/                 # Fastify 后端
├─ packages/
│  ├─ shared/                 # 前后端共享类型、状态和事件结构
│  ├─ agent-core/             # Agent 计划、决策、判断和工具循环
│  └─ browser/                # Playwright、虚拟鼠标和证据采集
├─ data/                      # 本地运行数据，不提交 Git
├─ artifacts/                 # 截图、网络记录、日志和 HTML 报告
├─ docs/                      # 项目文档
├─ pnpm-workspace.yaml
└─ package.json
```

## 五、系统模块

### 5.1 Vue 前端

负责：

- 测试配置、新建测试和测试计划编辑。
- 测试开始、停止和按原计划重跑。
- 展示任务进度、虚拟鼠标状态、步骤结果和执行说明。
- 查看历史任务、在线报告、HTML 报告和 Evals。
- 在任意页面持续显示“任务执行中”。

前端不保存 OpenAI API Key，也不直接操作 Playwright。

### 5.2 Fastify 后端

负责：

- 对外提供 REST API 和 SSE 事件流。
- 校验请求、管理任务状态和限制并发数量。
- 调用 Agent、Playwright、数据库和报告模块。
- 在前端切换页面或断开连接后继续执行任务。
- 向前端提供截图和 HTML 报告等本地文件。

### 5.3 Agent 核心

负责：

- 把自然语言测试目标转换为结构化测试计划。
- 根据当前步骤、页面状态和历史工具结果选择下一步工具。
- 对照预期结果和证据判断步骤通过、失败或阻塞。
- 生成面向用户的简洁执行说明和问题总结。

Agent 不直接控制浏览器，只能调用受控工具；页面不展示模型内部隐藏思考过程。

### 5.4 Playwright 执行器

负责：

- 启动用户可见的 Chrome 测试窗口。
- 打开页面、定位元素、点击、输入、等待和读取页面内容。
- 获取 DOM、URL、页面提示和必要的浏览器状态。
- 将 Agent 工具调用转换为确定的浏览器操作。
- 为每个任务创建独立 Browser Context。

MVP 采用：

```ts
chromium.launch({
  headless: false,
  channel: 'chrome'
})
```

### 5.5 虚拟鼠标

Playwright 的点击不会移动操作系统真实鼠标，因此 AgentQA 在测试页面中注入虚拟鼠标覆盖层。

虚拟鼠标应同步展示：

- 正在定位
- 正在移动
- 准备点击
- 正在输入
- 等待页面响应
- 操作失败

点击由 Playwright 完成，虚拟鼠标只负责可视化，不抢占用户真实鼠标。

### 5.6 证据与报告

负责采集：

- 页面截图
- 请求地址、方法、状态码、请求数据和响应摘要
- 控制台错误与警告
- 页面实际结果
- Agent 的判断结论和可读执行说明

每个步骤的结论必须能关联到对应证据。报告同时支持页面查看和导出 HTML。

## 六、核心执行流程

```mermaid
flowchart TD
    A["用户创建测试任务"] --> B["Agent 生成结构化测试计划"]
    B --> C["用户新增、修改或删除步骤"]
    C --> D["用户批准执行"]
    D --> E["后端创建运行记录并启动可见 Chrome"]
    E --> F["用户手动登录目标系统"]
    F --> G["Agent 选择受控工具"]
    G --> H["Playwright 执行页面操作"]
    H --> I["虚拟鼠标同步展示动作"]
    I --> J["采集页面、网络、截图和控制台证据"]
    J --> K["Agent 判断步骤结果"]
    K --> L{"是否还有步骤"}
    L -- "是" --> G
    L -- "否" --> M["生成在线报告与 HTML 报告"]
```

结构化动作示例：

```ts
{
  action: 'click',
  target: '确认新增按钮',
  expectedResult: '出现新增成功提示'
}
```

首批受控工具：

```text
open_page
click_element
fill_input
read_page
inspect_network
inspect_console
take_screenshot
assert_result
```

所有工具输入和输出使用 Zod 校验。Agent 循环必须限制最大步骤数和单步超时时间。

## 七、任务运行机制

- MVP 同一时间只允许一个任务处于 `running` 或 `paused`。
- 任务在后端运行，不依赖测试执行页面是否打开。
- 前端重新进入后，通过任务详情接口恢复状态，再连接 SSE 接收增量事件。
- 普通测试步骤失败时记录证据并继续后续步骤。
- 页面无法操作、登录失效或环境中断时暂停，等待人工处理。
- 用户主动停止后保留已经产生的结果和证据，并生成未完成报告。
- AgentQA 异常退出后，原运行中任务在下次启动时标记为中断，不自动继续操作页面。

## 八、状态设计

### 8.1 任务状态

| 状态 | 含义 |
|---|---|
| `draft` | 草稿 |
| `planning` | 正在生成计划 |
| `ready` | 计划已生成，等待确认 |
| `running` | 正在执行 |
| `paused` | 等待人工登录或处理环境问题 |
| `completed` | 执行完成 |
| `stopped` | 用户主动停止 |
| `failed` | 系统故障，无法继续 |

### 8.2 步骤状态

| 状态 | 含义 |
|---|---|
| `pending` | 等待执行 |
| `running` | 正在执行 |
| `passed` | 验证通过 |
| `failed` | 发现业务问题，任务可继续 |
| `blocked` | 环境问题导致无法执行 |
| `skipped` | 前置条件不满足而跳过 |

步骤 `failed` 表示测出了问题；任务 `failed` 表示 AgentQA 或测试环境出现无法恢复的故障。

## 九、前后端通信

### 9.1 REST API

```text
POST   /api/tasks              创建测试任务
GET    /api/tasks              获取历史任务
GET    /api/tasks/:id          获取任务详情
POST   /api/tasks/:id/plan     生成测试计划
PUT    /api/plans/:id          修改测试计划
POST   /api/tasks/:id/start    开始执行
POST   /api/tasks/:id/stop     停止执行
POST   /api/tasks/:id/resume   人工处理后继续执行
GET    /api/tasks/:id/report   查看报告
POST   /api/tasks/:id/rerun    按原计划重跑
POST   /api/evals/run          运行评估
```

### 9.2 SSE

```text
GET /api/tasks/:id/events
```

建议事件类型：

```text
task.status.changed
step.started
step.completed
browser.cursor.changed
browser.action.started
browser.action.completed
evidence.created
agent.summary.created
report.created
```

SSE 只负责服务端向前端推送事件，开始、停止、继续等操作仍使用 REST API。

## 十、数据与文件存储

MySQL 保存结构化数据：

- 测试配置
- 测试任务
- 测试计划
- 测试步骤
- 运行记录
- 步骤结果
- 证据索引
- 测试报告
- Evals 场景与结果

本地文件保存大体积证据：

```text
artifacts/
└─ {taskId}/
   ├─ screenshots/
   ├─ network/
   ├─ console/
   └─ report.html
```

数据库只记录文件路径、类型、所属任务和所属步骤，不把截图二进制直接存入 MySQL。

## 十一、配置与安全

- OpenAI API Key、数据库密码仅保存在后端 `.env`。
- 前端、日志、数据库和报告不得出现完整密钥。
- 默认只允许测试用户明确配置的本地前端和接口地址。
- 前端地址和接口地址分别配置，避免误连线上服务。
- 网络数据、截图和登录状态全部保存在本地。
- `.env`、`artifacts/`、浏览器登录状态和本地运行数据不得提交 Git。

```env
OPENAI_API_KEY=
OPENAI_MODEL=
DATABASE_URL=mysql://user:password@localhost:3306/agentqa
WEB_PORT=5173
SERVER_PORT=3000
ARTIFACTS_DIR=./artifacts
```

## 十二、AgentQA 自身测试

| 层级 | 测试内容 |
|---|---|
| 单元测试 | 计划转换、结构校验、断言判断、状态流转 |
| 接口测试 | Fastify API、错误处理和 MySQL 数据读写 |
| 集成测试 | Agent 工具调用与 Playwright 浏览器操作 |
| Evals | 计划覆盖度、工具选择、问题识别和判断稳定性 |

项目提供一个本地测试靶场页面，至少包含：

- 正常表单提交
- 必填校验缺失
- 接口返回异常
- 边界值错误
- 页面与接口数据不一致
- 登录状态失效

先使用靶场页面调通和回归 AgentQA，再测试真实项目中的“新增红包”。

## 十三、本地运行拓扑

```text
用户
  ├─ AgentQA Web：http://localhost:5173
  └─ 可见 Chrome：目标本地业务页面

AgentQA Web
  ├─ REST
  └─ SSE
       ↓
AgentQA Server：http://localhost:3000
  ├─ Agent Core → OpenAI API
  ├─ Browser Package → Playwright → Chrome
  ├─ Drizzle ORM → MySQL
  └─ Report/Evidence → artifacts/
```

## 十四、后续扩展边界

MVP 完成后再评估：

- 微信小程序执行适配器
- PostgreSQL 和服务端部署
- Redis 与任务队列
- 多用户、权限和并发任务
- Docker、CI/CD 和可观测性平台
- 更多浏览器与真实设备测试

这些能力不进入当前 MVP，避免破坏首个 Web 测试闭环的交付节奏。

## 十五、架构结论

AgentQA MVP 采用本地优先的 Node.js + TypeScript Monorepo。Vue 提供操作界面，Fastify 负责任务协调，OpenAI Agent 通过受控工具驱动 Playwright，用户在可见 Chrome 中实时观察虚拟鼠标、点击和输入过程；MySQL 保存结构化数据，本地文件保存证据与 HTML 报告，SSE 保证任务执行状态可以实时展示。
