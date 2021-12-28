import shell from 'shelljs';

export const TASK_NAME_PUBLISH = '发布到 NPM';

// TODO: 使用 "模板方法模式" 组织代码
export default {
  name: TASK_NAME_PUBLISH,
  async excute({ ctx, task }) {
    if (!ctx.error) {
      const PART_NAME = '切换到新创建好的项目';

      task.title = PART_NAME;

      if (shell.cd(ctx.payload.get('newProjectPath')).code !== 0) {
        ctx.error = true;
        ctx.message = `"${TASK_NAME_PUBLISH}" 任务在 "${PART_NAME}" 环节出错`;
      }
    }

    if (!ctx.error) {
      const PART_NAME = '发布中';

      task.title = PART_NAME;

      const excuted = shell.exec('npm publish', { silent: true });

      if (excuted.code !== 0) {
        ctx.error = true;

        ctx.message = [
          `"${TASK_NAME_PUBLISH}" 任务在 "${PART_NAME}" 环节出错,`,
        ].concat(excuted.stderr.split('\n'));
      }
    }

    if (ctx.error) {
      task.skip('未能成功发布');
    } else {
      task.title = '成功发布';
    }
  },
};
