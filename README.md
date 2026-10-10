# Model Hint — QwenPaw 前端插件

在每条 AI 回复的**页脚**显示本次回复实际使用的模型 `provider:model`，并为不同模型分配**不同的马卡龙色**——同一个模型始终同一个颜色，一段对话里中途切换了模型可以一眼看出来。

> English summary: a QwenPaw Web Console frontend plugin that shows the model
> (`provider:model`) used for each AI reply as a footer badge, with a stable
> macaron color per model so a mid-conversation model switch is obvious.

![badge example](docs/screenshot.png)

---

## 特性

- 🏷️ 每条 AI 回复页脚显示 `provider:model`（如 `kilo:kilo-auto/free`）
- 🎨 按模型名做稳定哈希 → 10 色马卡龙调色板；同模型同色、换模型变色
- ✍️ 字体使用 Montserrat（自动注入 Google Fonts，连不上则回退系统 sans-serif）
- 🧩 纯前端扩展，**不修改任何 QwenPaw 核心代码**
- ♻️ 可随时启用 / 停用 / 卸载

## 工作原理

- 挂载点：`window.QwenPaw.chat.actions.add(pluginId, { id, render })`
  （消息页脚操作区，与复制按钮 / 时间戳同排，是本版本 Web Console 中**确实会被渲染**的扩展点）。
- 数据来源：每条消息的响应卡
  `message.cards.find(c => c.code === "AgentScopeRuntimeResponseCard").data.usage`
  中的 `provider_id` / `model_name`。该 `usage` 由 QwenPaw 的 SSE `turn_usage`
  事件在回复结束后异步补丁写入。

> ⚠️ 说明：官方文档里的 `chat.response.append` 示例在部分 Web Console 构建中
> **没有渲染消费者**（能注册但回调永不触发）。本插件因此改用 `chat.actions`，
> 这是经实测可用的挂载点。

## 安装

### 方式一：从本地目录安装（推荐）

```bash
# 下载/克隆本仓库后，在仓库根目录执行：
qwenpaw plugin install ./model-hint
# 或指向解压后的插件目录
qwenpaw plugin install /path/to/model-hint
```

### 方式二：从 ZIP 安装

```bash
qwenpaw plugin install https://example.com/model-hint-v1.0.0.zip
# 或本地 zip
qwenpaw plugin install /path/to/model-hint-v1.0.0.zip
```

### 启用后

- QwenPaw 运行中安装会**热加载**，无需重启后端。
- 打开 Web Console 聊天页，**浏览器 Ctrl+F5 硬刷新**一次即可看到效果。

常用管理命令：

```bash
qwenpaw plugin list              # 查看已安装插件
qwenpaw plugin info model-hint   # 查看详情
qwenpaw plugin validate ./model-hint
qwenpaw plugin uninstall model-hint
```

## 目录结构

```
model-hint/
├── plugin.json      # 插件清单（必需）
├── dist/
│   └── index.js     # 已构建的前端 bundle（安装时实际加载的文件）
├── src/
│   └── index.tsx    # 源码
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── LICENSE
```

> 安装时**最少**只需要 `plugin.json` + `dist/index.js`；其余文件用于二次开发。

## 从源码构建

```bash
npm install
npm run build        # 产物输出到 dist/index.js
```

构建后把 `dist/index.js` 复制到已安装目录（`<WORKING_DIR>/plugins/model-hint/dist/`），
再 Ctrl+F5 刷新浏览器即可。无需重启 QwenPaw。

## 自定义

打开 `src/index.tsx`：

- **调色板**：修改 `MACARON` 数组（每项 `{ bg, border, text }`），增删颜色即可。
- **字体**：修改 `fontFamily`，或移除 `ensureMontserrat()` 的字体注入。
- **文案 / 样式**：修改 `render` 返回的 `span` 样式与标签文本。

改完 `npm run build`，复制 `dist/index.js`，Ctrl+F5。

## 兼容性

- QwenPaw：`>= 2.0.0`（前端扩展 API `window.QwenPaw.chat.actions`）。
- 已验证版本：QwenPaw v2.2.1，模型标签显示正常。

## License

MIT © QwenPaw QA Agent
