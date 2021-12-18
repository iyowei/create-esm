import { join, basename } from "path";
import { copySync } from "fs-extra";

import { TPL_DOT_VSCODE } from "../paths.js";

export const TASK_NAME_COPY = "拷贝文件";

// TODO: 独立成专门的 API 模块
// TODO: 解析文件中的依赖，检查是否有相对路径对应的文件并不在拷贝列表内
export default async function taskCopy({ ctx, task, opts }) {
  if (!ctx.error) {
    // TODO: 异步化
    [...opts.get("targets").map((cur) => cur.path), TPL_DOT_VSCODE].forEach(
      (cur) => {
        // TODO: 单独实现 `copySync` 方法，移除对 "fs-extra" 的依赖
        copySync(cur, join(opts.get("newProjectPath"), basename(cur)));
      }
    );

    task.title = "已拷贝完所有文件";
  } else {
    task.skip("未能拷贝");
  }
}
