// Electron 主进程：标准窗口，直接加载 index.html（不改动页面逻辑）
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// 本应用仅加载本地离线页面（无远程内容），关闭 Chromium 沙箱以确保在受限/远程桌面等
// 环境下双击 exe 也能稳定启动（DSH 受限会话实测需要）。
app.commandLine.appendSwitch('no-sandbox');

// 打包后自检（仅显式 --selftest 参数触发，正常双击完全不受影响）：
// 隐藏窗口加载 index.html，验证页面/词库/localStorage 后写结果文件并退出。
if (process.argv.includes('--selftest')) {
  // 自检使用 exe 同目录的独立数据目录（不影响正常使用的 userData）
  app.setPath('userData', path.join(path.dirname(process.execPath), '.selftest-userdata'));
  app.whenReady().then(async () => {
    const res = { error: null };
    try {
      const win = new BrowserWindow({ show: false });
      await win.loadFile(path.join(__dirname, 'index.html'));
      await new Promise(r => setTimeout(r, 800));
      res.title = await win.webContents.executeJavaScript('document.title');
      res.words = await win.webContents.executeJavaScript('window.WORDS && window.WORDS.length');
      res.homeVisible = await win.webContents.executeJavaScript('!!document.getElementById("view-home")');
      res.stateLen = (await win.webContents.executeJavaScript('localStorage.getItem("wordQuizState")') || '').length;
      res.oldMarker = await win.webContents.executeJavaScript('localStorage.getItem("__selftest__")');
      const marker = 'exe-selftest-' + Date.now();
      await win.webContents.executeJavaScript('localStorage.setItem("__selftest__", ' + JSON.stringify(marker) + ')');
      res.sameSessionReadback = (await win.webContents.executeJavaScript('localStorage.getItem("__selftest__")')) === marker;
    } catch (e) {
      res.error = String((e && e.stack) || e);
    }
    fs.writeFileSync(path.join(path.dirname(process.execPath), 'selftest-result.json'), JSON.stringify(res, null, 2));
    app.quit();
  });
  return;
}

// 单实例运行：重复双击时聚焦已有窗口
const gotLock = app.requestSingleInstanceLock ? app.requestSingleInstanceLock() : true;
if (!gotLock) {
  app.quit();
}

let mainWin = null;

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 720,
    minHeight: 560,
    title: '词汇筛查',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  // 页面本身 <title>词汇筛查</title>，启动即进主页（index.html 默认视图）
  mainWin.loadFile(path.join(__dirname, 'index.html'));
  mainWin.setMenuBarVisibility(false);
  mainWin.on('closed', () => { mainWin = null; });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('second-instance', () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
