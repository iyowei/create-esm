import shell from 'shelljs';

export const TASK_NAME_PUSH_CODE = '推送代码';

// TODO: 独立成专门的 API 模块
export default async function taskPushCode({ ctx, task, opts }) {
  if (!ctx.error) {
    const PART_NAME = '切换到新创建好的项目';

    task.title = PART_NAME;

    if (shell.cd(opts.get('newProjectPath')).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_PUSH_CODE}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  const FIRST_VERSION = 'v1.0.0';

  if (!ctx.error) {
    const PART_NAME = '追踪所有文件';

    task.title = PART_NAME;

    const cmdTrackAll = 'git add -A';

    if (shell.exec(cmdTrackAll, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_PUSH_CODE}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    const PART_NAME = '提交所有文件';

    task.title = PART_NAME;
    const cmdCommitAll = `git commit -m "${FIRST_VERSION}"`;

    if (shell.exec(cmdCommitAll, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_PUSH_CODE}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    const PART_NAME = `贴标签：${FIRST_VERSION}`;

    task.title = PART_NAME;
    const cmdTag = `git tag ${FIRST_VERSION}`;

    if (shell.exec(cmdTag, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_PUSH_CODE}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    const PART_NAME = '推送至 Github';

    task.title = PART_NAME;
    const cmdPushSource = 'git push -u origin main';

    if (shell.exec(cmdPushSource, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_PUSH_CODE}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    const PART_NAME = '推送标签';

    task.title = PART_NAME;
    const cmdPushTags = 'git push --tags';

    if (shell.exec(cmdPushTags, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_PUSH_CODE}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (ctx.error) {
    task.skip('未能成功推送至 Github');
  } else {
    task.title = '成功推送至 Github';
  }
}
