import shell from 'shelljs';

export const TASK_NAME_UPDATE_CHANGELOG = '发布更新日志';

// TODO: 使用 "模板方法模式" 组织代码
export default async function taskCreateChangelog({ ctx, task, opts }) {
  if (!ctx.error) {
    const PART_NAME = '切换到新创建好的项目';

    task.title = PART_NAME;

    if (shell.cd(opts.get('newProjectPath')).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_UPDATE_CHANGELOG}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    const PART_NAME = '推送更新日志';

    task.title = PART_NAME;

    const FIRST_VERSION = 'v1.0.0';
    const cmdRelease = `gh release create ${FIRST_VERSION} --generate-notes`;

    if (shell.exec(cmdRelease, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_UPDATE_CHANGELOG}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (ctx.error) {
    task.skip('未能发布更新日志');
  } else {
    task.title = '已发布更新日志';
  }
}
