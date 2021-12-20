import { readFileSync, mkdirSync, writeFileSync, existsSync, watch } from 'fs';

import fastGitignore from '@iyowei/fast-gitignore';
import isEmpty from 'lodash/isEmpty.js';
import shell from 'shelljs';

import print from '../print.js';

export const TASK_NAME_CREATE_REPO = '创建项目';

// TODO: 独立成专门的 API 模块
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
      repo = `${opts.get('namespace')}/${opts.get('name')}`;
    } else {
      if (isEmpty(opts.get('githubOrgName'))) {
        repo = opts.get('name');
      } else {
        repo = `${opts.get('githubOrgName')}/${opts.get('name')}`;
      }
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
    task.title = '生成 .gitignore';

    writeFileSync(
      opts.get('gitignore').output,
      Object.values(
        // TODO: 如果是仓库里所有的模板都要的话，设置 ignore 为空数组即是
        await fastGitignore({
          ignore: [
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
          templatesDir: opts.get('gitignore').source,
        }),
      ).join('\n\n\n'),
    );
  }

  if (!ctx.error) {
    if (opts.get('generateReadme')) {
      task.title = '生成 README.md';

      print({
        outputPath: opts.get('prints').readme.output,
        templatePath: opts.get('prints').readme.source,
        data: {
          name: opts.get('name'),
          description: opts.get('description'),
        },
      });
    }
  }

  if (ctx.error) {
    task.skip('未能创建 Github 项目');
  } else {
    task.title = '成功创建 Github 项目';
  }
}
