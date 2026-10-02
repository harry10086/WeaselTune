# WeaselTune (小狼毫配置调优中心)

WeaselTune 是一款专为 **小狼毫（Weasel）输入法** 量身定制的现代图形化调优与管理工具。

基于 **Tauri 2.x + Rust + React + TypeScript** 构建，具备极小体积、极速启动、原生底层支持与高保真现代化视觉体验。
![dashboard](https://github.mianao.info/https://raw.githubusercontent.com/harry10086/picx-images-hosting/master/Rime/dashboard.webp)
---

## 🌟 核心特性

1. **Rime 原生补丁体系安全同步（Zero Destruction）**：
   - 遵循 Rime 原生机制，绝不直接篡改或覆盖底层原始 YAML 文件。
   - 所有定制化修改一律结构化写入 `%APPDATA%\Rime\*.custom.yaml` 的 `patch:` 节点。
   - 无论日后如何拉取或更新雾凇拼音最新词库与脚本，您的个人定制配置绝不丢失。

2. **以雾凇拼音（rime-ice）为基准模板**：
   - 深度拆解 [rime-ice](https://github.com/iDvel/rime-ice) 配置源。
   - 可视化提供平翘舌（z↔zh）、鼻边音（l↔n）、唇齿音（f↔h）、前后鼻音等完整模糊音规则开关。
   - 完整支持 Lua 词典释义滤镜（中英双向释义、最大释义项数、最大字符限制）。
   - 包含 Emoji 候选、简繁切换、部件拆字（radical_pinyin）、英文混输补全（melt_eng）及 Markdown 成对符号居中。

3. **无损外挂自定义词典与扩展词库（Lossless Custom Dictionaries）**：
   - 支持一键导入外部 `.dict.yaml` 或词条文本，或一键新建自定义空词库。
   - 采用标准 Rime 扩展挂载架构：自动在用户目录维护 `rime_ice.extended.dict.yaml` 并通过补丁挂载，**完全不改动原版 `rime_ice.dict.yaml`**。
   - 上游更新雾凇拼音源码或重新拉取词库时，个人专业词库永不冲突、永不丢失。
   - 支持在界面中直观开关挂载状态、调出系统默认编辑器直接编辑词条、或在资源管理器中一键高亮定位。

4. **实时候选框所见即所得模拟渲染**：
   - 内置小狼毫真实候选框渲染模拟引擎。
   - 实时预览横排/竖排布局、预编辑拼音光标、皮肤配色、候选字号、圆角与边框。
   - 精选收录雾凇拼音与小狼毫经典高颜值皮肤（纯粹 Purity、远山雪 Nord、微信键盘风等），支持一键“恢复默认颜色”。

5. **自定义短语与快捷输入表格编辑器**：
   - 可视化表格管理 `%APPDATA%\Rime\custom_phrase.txt`。
   - 支持快捷录入手机号、常用邮箱、模板文字，支持快速增删改查、排序及纯文本导出备份。

6. **特定应用专属行为（app_options）**：
   - 针对终端（Windows Terminal, CMD, PowerShell）、代码编辑器（VS Code）、浏览器等独立设置启动时默认英文模式或行内预编辑。

7. **用户词典同步（Rime Sync）与跨设备同步管理**：
   - 可视化配置 `%APPDATA%\Rime\installation.yaml` 中的设备识别代号（`installation_id`）与全局同步目录（`sync_dir`，支持网盘与坚果云）。
   - 支持选择同步文件夹、一键打开同步目标目录，以及直接调用 `WeaselDeployer.exe /sync` 触发静默同步。

8. **自动时间戳备份、Diff 比对与一键安全回滚**：
   - 每次保存写入补丁前自动生成时间戳备份。
   - 内置 Diff 差异查看器，清楚展示修改内容。
   - 支持一键还原至任意历史版本。

9. **静默自动重新部署（Silent Deploy）**：
   - 自动探测注册表与小狼毫安装路径（支持 0.16.x 与 0.17.x）。
   - 保存后可直接静默调用 `WeaselDeployer.exe /deploy`，无需手动在任务栏托盘点击右键。

---

## 🛠️ 开发与构建指南 (Development Guide)

### 1. 前置环境要求 (Prerequisites)

在开始克隆和运行本项目前，请确保您的开发环境中已安装以下核心工具：

- **Node.js**：
  - 推荐版本：`v20.x` LTS 以上（自带 npm 包管理器）。
  - 验证命令：
    ```bash
    node -v
    npm -v
    ```
- **Rust 编译环境 (Rust toolchain)**：
  - Tauri 2.x 底层由 Rust 驱动，需要 Rust 编译器与 Cargo 工具。
  - 安装方法：访问 [Rust 官方安装指南](https://www.rust-lang.org/tools/install) 下载并运行 `rustup-init.exe`。
  - 验证命令：
    ```bash
    rustc --version
    cargo --version
    ```
- **C++ 构建工具 (Microsoft C++ Build Tools)**：
  - Windows 环境下必须具备 MSVC 编译链接器。
  - 安装方法：通过 [Visual Studio Installer](https://visualstudio.microsoft.com/visual-cpp-build-tools/) 安装，并务必勾选 **“使用 C++ 的桌面开发” (Desktop development with C++)**。
- **WebView2 Runtime**：
  - Windows 10/11 通常已默认随系统预装。若精简版系统缺失，请前往微软官网下载安装 Evergreen 独立安装包。

---

### 2. 获取源码与依赖安装 (Setup)

```bash
# 1. 克隆代码仓库至本地
git clone https://github.com/harry10086/WeaselTune.git

# 2. 进入项目主目录
cd WeaselTune

# 3. 安装前端模块依赖 (React 19 / TypeScript / Vite / Lucide-react 等)
npm install
```

> 💡 **说明**：Rust 后端核心依赖（Tauri 2.x、Serde、serde_yaml、chrono、winreg 等）已在 `src-tauri/Cargo.toml` 中配置好。在首次运行开发或打包指令时，Cargo 会自动下载并编译所有依赖库，**无需手动安装**。

---

### 3. 本地开发与实时热更新 (Development)

```bash
# 一键启动全栈桌面开发模式（前端 Vite + 后端 Tauri）
npm run tauri dev
```

- **开发特性说明**：
  - **前端热重载 (HMR)**：修改 `src/` 下的任意 React 组件、TS 逻辑或 CSS 样式后，桌面窗口毫秒级实时刷新，无需重启应用。
  - **后端自动重编译**：修改 `src-tauri/src/` 下的 Rust 代码时，Tauri 会自动重新编译底层二进制并重载窗口。
  - **开发者工具 (DevTools)**：在应用窗口中按下 `F12` 键即可呼出 Chromium 开发者调试控制台，查看网络请求、控制台日志与 DOM 结构。

---

### 4. 生产构建与打包发布 (Build & Release)

项目支持两种打包分发形式，按需选择：

#### 方案 A：纯绿色便携单文件版 (Portable EXE) — 推荐日常使用
适合无需安装直接运行、放入 U 盘随身携带或直接分享：
```bash
npm run build:portable
```
- **输出文件**：`src-tauri/target/release/WeaselTune.exe`
- **体积优势**：体积仅约 **4.6 MB**，双击秒开，原生无冗余，不在系统留下残留。

#### 方案 B：完整向导安装包 (NSIS Setup / MSI)
适合需要桌面快捷方式、开始菜单图标与控制面板标准卸载支持的用户：
```bash
# 制作 Windows 安装包（NSIS / MSI）
npm run build:installer
# 或运行标准构建
npm run tauri build
```
- **输出文件**：`src-tauri/target/release/bundle/nsis/WeaselTune_0.1.0_x64-setup.exe`

---

### 5. 常见构建与调试问题排查 (FAQ)

- **Q1: PowerShell 提示“无法加载脚本，因为在此系统上禁止运行脚本” (`PSSecurityException`)**
  - **原因**：Windows PowerShell 默认的脚本执行策略限制。
  - **解决**：在终端中执行以下命令放行当前用户脚本权限：
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```
    或者直接在传统的 CMD 命令提示符中执行 `npm run ...`。

- **Q2: Cargo 编译报错 `error: linker link.exe not found`**
  - **原因**：开发机未安装 Microsoft C++ 构建工具或未配置环境变量。
  - **解决**：打开 Visual Studio Installer，安装“使用 C++ 的桌面开发”工作负载并重启终端。

- **Q3: 提示 `Blocking waiting for file lock on build directory`**
  - **原因**：上一次运行的 dev 调试进程未完全退出，占用了 target 目录文件锁。
  - **解决**：在任务管理器中关闭残留的 `WeaselTune.exe` 进程，或在终端按下 `Ctrl + C` 退出后再重新运行。

---

## 📂 项目结构
```
WeaselTune/
├── src-tauri/               # Rust 后端核心
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── detector.rs      # Windows 注册表与小狼毫环境探测
│       ├── patcher.rs       # 安全的 Rime custom.yaml 补丁读写引擎
│       ├── deployer.rs      # WeaselDeployer.exe 静默部署调用
│       ├── backup.rs        # 时间戳备份、差异对比与回滚
│       ├── phrases.rs       # custom_phrase.txt 表格化解析与序列化
│       └── lib.rs           # Tauri IPC 命令注册与全链路集成测试
└── src/                     # React 前端现代 UI
    ├── components/
    │   ├── CandidatePreview.tsx # 实时候选框高保真预览
    │   ├── DashboardView.tsx    # 仪表盘与环境诊断
    │   ├── AppearanceView.tsx   # 外观、皮肤、横竖排与圆角
    │   ├── RimeIceView.tsx      # 雾凇拼音功能开关与模糊音
    │   ├── KeysView.tsx         # 翻页按键与中英切换习惯
    │   ├── PhrasesView.tsx      # 自定义短语可视化表格
    │   ├── AppRulesView.tsx     # 特定应用英文模式规则
    │   └── BackupDiffView.tsx   # 备份历史与 Diff 比对回滚
    ├── types.ts             # 强类型定义
    ├── index.css            # 现代深色设计系统
    └── App.tsx              # 应用主体与导航

```
