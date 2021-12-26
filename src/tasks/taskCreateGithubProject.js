import isEmpty from 'lodash/isEmpty.js';
import shell from 'shelljs';
import { writeGitignore, writeReadme } from '@iyowei/create-templates';

export const TASK_NAME_CREATE_REPO = '创建项目';

// TODO: 使用 "模板方法模式" 组织代码
export default async function taskCreateGithubProject({ ctx, task, opts }) {
  if (!ctx.error) {
    const PART_NAME = '切换到输出目录';

    task.title = PART_NAME;

    if (shell.cd(opts.get('output')).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_CREATE_REPO}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  // TODO: 检测输出目录是否已存在同名项目，如果存在的话就挂断程序

  if (!ctx.error) {
    const PART_NAME = '建立安全的 SSH 管道';

    task.title = PART_NAME;

    const cmdSafetySSHTunnel = `eval ssh-agent && ssh-add ${opts.get(
      'sshkey',
    )}`;

    if (shell.exec(cmdSafetySSHTunnel, { silent: true }).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_CREATE_REPO}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    let repo;

    if (opts.get('githubOrgNameSameWithNpmOrg')) {
      // same name
      repo = `${opts.get('namespace')}/${opts.get('name')}`;
    } else if (isEmpty(opts.get('githubOrgName'))) {
      // not same name, no github org
      repo = opts.get('name');
    } else {
      // not same name, has github org
      repo = `${opts.get('githubOrgName')}/${opts.get('name')}`;
    }

    const PART_NAME = `创建 ${repo} 项目`;

    task.title = PART_NAME;

    const cmd = `gh repo create ${repo} -d "${opts.get(
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
          output: opts.get('gitignore').output,
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
        if (opts.get('generateReadme')) {
          writeReadme({
            output: opts.get('prints').readme.output,
            data: {
              name: opts.get('name'),
              description: opts.get('description'),
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
