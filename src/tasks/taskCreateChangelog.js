import shell from "shelljs";

export const TASK_NAME_UPDATE_CHANGELOG = "发布更新日志";

// TODO: 独立成专门的 API 模块
export default async function taskCreateChangelog({ ctx, task, opts }) {
  if (!ctx.error) {
    const PART_NAME = "切换到新创建好的项目";

    task.title = PART_NAME;

    if (shell.cd(opts.get("newProjectPath")).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_UPDATE_CHANGELOG}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    // TODO: 首次发布文案

    const PART_NAME = "推送更新日志";

    task.title = PART_NAME;

    const FIRST_VERSION = "v1.0.0";
    const cmdRelease = `gh release create ${FIRST_VERSION} --notes "${FIRST_VERSION}"`;

    if (shell.exec(cmdRelease, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_UPDATE_CHANGELOG}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (ctx.error) {
    task.skip("未能发布更新日志");
  } else {
    task.title = "已发布更新日志";
  }
}
