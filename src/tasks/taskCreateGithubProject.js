import isEmpty from 'lodash/isEmpty.js';
import shell from 'shelljs';
import { writeGitignore, writeReadme } from '@iyowei/create-templates';

export const TASK_NAME_CREATE_REPO = '创建项目';

// TODO: 使用 "模板方法模式" 组织代码
export default async function taskCreateGithubProject({ ctx, task }) {
  if (!ctx.error) {
    const PART_NAME = '切换到输出目录';

    task.title = PART_NAME;

    if (shell.cd(ctx.payload.get('output')).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_CREATE_REPO}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  // TODO: 检测输出目录是否已存在同名项目，如果存在的话就挂断程序

  if (!ctx.error) {
    const PART_NAME = '建立安全的 SSH 管道';

    task.title = PART_NAME;

    const cmdSafetySSHTunnel = `eval ssh-agent && ssh-add ${ctx.payload.get(
      'sshkey',
    )}`;

    if (shell.exec(cmdSafetySSHTunnel, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_CREATE_REPO}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    let repo;

    if (ctx.payload.get('githubOrgNameSameWithNpmOrg')) {
      // same name
      repo = `${ctx.payload.get('namespace')}/${ctx.payload.get('name')}`;
    } else if (isEmpty(ctx.payload.get('githubOrgName'))) {
      // not same name, no github org
      repo = ctx.payload.get('name');
    } else {
      // not same name, has github org
      repo = `${ctx.payload.get('githubOrgName')}/${ctx.payload.get('name')}`;
    }

    const PART_NAME = `创建 ${repo} 项目`;

    task.title = PART_NAME;

    const cmd = `gh repo create ${repo} -d "${ctx.payload.get(
      'description',
    )}" -l mit -c --disable-wiki --public`;
    const excuted = shell.exec(cmd, { silent: true });

    if (excuted.code !== 0) {
      ctx.error = true;
      ctx.message = [
        `"${TASK_NAME_CREATE_REPO}" 任务在 "${PART_NAME}" 环节出错,`,
      ].concat(excuted.stderr.split('\n'));
    }
  }

  if (!ctx.error) {
    const PART_NAME = '生成 .gitignore、README.md';

    task.title = PART_NAME;

    await Promise.all([
      new Promise((resolve, reject) => {
        writeGitignore({
          output: ctx.payload.get('gitignore').output,
          topics: [
            'macOS',
            'Windows',
            'Linux',
            'Node',
            'VisualStudioCode',
            'SublimeText',
            'CVS',
            'Diff',
            'Vim',
            'TortoiseGit',
          ],
        }).then(
          () => {
            resolve();
          },
          (err) => {
            reject(err);
          },
        );
      }),
      new Promise((resolve, reject) => {
        if (ctx.payload.get('generateReadme')) {
          writeReadme({
            output: ctx.payload.get('prints').readme.output,
            data: {
              name: ctx.payload.get('name'),
              description: ctx.payload.get('description'),
            },
          }).then(
            () => {
              resolve();
            },
            (err) => {
              reject(err);
            },
          );
          return;
        }
        resolve();
      }),
    ]).catch(() => {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_CREATE_REPO}" 任务在 ${PART_NAME} 任务环节出错`;
    });
  }

  if (ctx.error) {
    task.skip('未能创建 Github 项目');
  } else {
    task.title = '成功创建 Github 项目';
  }
}
