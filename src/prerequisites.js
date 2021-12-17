import shell from 'shelljs';
import terminateCli from "./terminateCli.js";

export default function prerequisites() {
  if (!shell.which("pnpm")) {
    terminateCli("必须安装 PNPM 包管理器");
  }

  if (!shell.which("gh")) {
    terminateCli("必须安装 Github 命令行工具");
  }

  // TODO: 研究，可否检查 GH、NPM 登录与否？
  // TODO: 检查必要的 Git 全局设置有效与否
}
