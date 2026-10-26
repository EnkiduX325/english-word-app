# 词汇筛查（Vocab Screener）

一个完全**离线**运行的英语单词筛查工具：内置 12000 词词库，在本地浏览器或桌面窗口中完成"过单词"筛选，把不认识的词一轮轮筛出来，分批复核、导出 CSV、打印错词表。无需联网、无任何依赖服务，数据全部保存在本地 `localStorage`。

## 核心功能

- **答对淘汰**：认识的单词直接淘汰，只保留不认识的词，一轮一轮缩小范围。
- **错词分轮**：每轮答错的词自动进入下一轮，形成逐轮筛减的轮次记录，进度持久化。
- **分批复核**：错词按每批 350 条分批导出 CSV（自动续接批号），可随时"导出本批错词 / 导出剩余错词"。
- **打印导出**：一键打印错词表（A4 布局），或导出 CSV 用于 Excel / 其他工具继续处理。

## 项目结构

```
词汇筛查/
├── index.html               # 核心业务逻辑（单页应用，含全部交互与导出/打印）
├── library.js               # 词库数据（window.WORDS，由 build_library_js.py 生成）
├── main.js                  # Electron 主进程（桌面窗口壳，直接加载 index.html）
├── package.json             # npm 工程配置（start 运行 / build 打包）
├── package-lock.json        # 依赖锁定（可复现安装）
├── build_library_js.py      # 词库构建脚本（final_library_12000.csv -> library.js）
├── final_library_12000.csv  # 原始词库数据源（12000 词）
├── README.md
└── LICENSE                  # MIT
```

## 运行源码

### 方式一：浏览器直接打开（最简单）

直接双击 `index.html` 即可在浏览器中运行，全部功能（答题、淘汰、分批导出 CSV、打印错词表）均可用。

> 提示：个别浏览器对本地 `localStorage` 的持久化策略可能不同；建议使用 Chrome / Edge。

### 方式二：以桌面应用运行（Electron）

需要 [Node.js](https://nodejs.org/)（建议 18+）：

```bash
npm install   # 安装依赖（仅首次）
npm start     # 启动桌面窗口
```

## 自己打包 exe（Windows）

在项目根目录执行：

```bash
npm install
npm run build
```

产物生成在：

```
dist/词汇筛查-win32-x64/词汇筛查.exe
```

整个 `dist/词汇筛查-win32-x64/` 文件夹即为可分发目录（exe 需要与同目录下的运行库文件一起分发，直接双击 `词汇筛查.exe` 即可运行，无需安装 Node.js）。

> **中国大陆网络提示**：`npm install` 安装 Electron 时若下载慢/失败，可先设置镜像再执行：
>
> ```bash
> # Windows PowerShell
> $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
> npm install
> ```

## 重新生成词库

词库数据（`library.js`）由 `final_library_12000.csv` 构建，运行：

```bash
python build_library_js.py
```

脚本会校验：词条总数必须为 12000、不允许空翻译、不允许重复单词；通过后重新生成 `library.js`。

## 词库来源

- 词库数据（`final_library_12000.csv`）来源于 **[ECDICT](https://github.com/skywind3000/ECDICT)**（开源英汉词典数据库，MIT 协议），从中清洗并筛选出 12000 个常用词条（优先四六级 CET4/CET6 词汇）。
- 感谢 ECDICT 项目及其贡献者。

## License

[MIT](LICENSE)
