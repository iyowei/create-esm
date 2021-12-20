#!/usr/bin/env node

import { Listr } from 'listr2';
import shell from 'shelljs';
import meow from 'meow';
import chalk from 'chalk';
import cancelOrContinue from '@iyowei/cli-cancel-or-continue';

import {
  banner,
  mainHelp,
  setupHelp,
  resetHelp,
  defaultsHelp,
  COMMAND_SET,
  COMMAND_DEFAULTS,
  COMMAND_RESET,
  getReport,
} from './src/messages.js';

import {
  updateGlobalConfigurations,
  getGlobalConfigurations,
  reset,
} from './src/options/global.js';
import makeOptions from './src/options/make.js';
import prerequisites from './src/prerequisites.js';

import taskCreateGithubProject from './src/tasks/taskCreateGithubProject.js';
import taskCreateNpmPackage from './src/tasks/taskCreateNpmPackage.js';
import taskCopy from './src/tasks/taskCopy.js';
import taskPushCode from './src/tasks/taskPushCode.js';
import taskPublish from './src/tasks/taskPublish.js';
import taskCreateChangelog from './src/tasks/taskCreateChangelog.js';

// TODO: 骨架化
(async function () {
  // 必要工具检查
  prerequisites();

  const cli = meow(mainHelp, {
    importMeta: import.meta,
    flags: {
      name: {
        type: 'string',
        alias: 'n',
      },
      description: {
        type: 'string',
      },
      output: {
        type: 'string',
        alias: 'o',
      },
      dependencies: {
        isMultiple: true,
        type: 'string',
        alias: 'd',
      },
      doubleCheckDependencies: {
        type: 'boolean',
        default: true,
      },
      sshkey: {
        type: 'string',
        alias: 'k',
      },
      personal: {
        type: 'boolean',
        default: false,
      },
      githubOrg: {
        type: 'string',
      },
      version: {
        type: 'boolean',
        alias: 'v',
      },
      help: {
        type: 'boolean',
        alias: 'h',
      },
    },
  });

  shell.echo(banner);

  // 二级指令：修改默认设置
  if (cli.input[0] === COMMAND_SET) {
    if (cli.flags.help) {
      shell.echo(setupHelp);
      return;
    }

    const SETUP_KEY = cli.input[1];
    const SETUP_VALUE = cli.input[2];

    updateGlobalConfigurations(SETUP_KEY, SETUP_VALUE);

    shell.echo(getGlobalConfigurations());

    return;
  }

  // 二级指令：查看默认配置
  if (cli.input[0] === COMMAND_DEFAULTS) {
    if (cli.flags.help) {
      shell.echo(defaultsHelp);
      return;
    }

    shell.echo(getGlobalConfigurations());

    return;
  }

  // 二级指令：清空
  if (cli.input[0] === COMMAND_RESET) {
    if (cli.flags.help) {
      shell.echo(resetHelp);
      return;
    }

    reset();
    shell.echo(getGlobalConfigurations());

    return;
  }

  if (cli.input.length === 0) {
    shell.echo(mainHelp);
    return;
  }

  // 统计选项
  const opts = await makeOptions(cli);

  // 创建前报告
  shell.echo(getReport(opts));

  // 确认
  await cancelOrContinue();

  // 生成

  console.log(opts);

  const tasks = new Listr(
    [
      {
        title: '创建项目',
        task: async (ctx, task) => {
          await taskCreateGithubProject({ ctx, task, opts });
        },
      },
      {
        title: '初始化 NPM',
        task: async (ctx, task) => {
          await taskCreateNpmPackage({ ctx, task, opts });
        },
      },
      {
        title: '拷贝文件',
        task: async (ctx, task) => {
          await taskCopy({ ctx, task, opts });
        },
      },
      {
        title: '推送到 Github',
        task: async (ctx, task) => {
          await taskPushCode({ ctx, task, opts });
        },
      },
      {
        title: '发布更新日志',
        task: async (ctx, task) => {
          await taskCreateChangelog({ ctx, task, opts });
        },
      },
      {
        title: '发布到 NPM',
        task: async (ctx, task) => {
          await taskPublish({ ctx, task, opts });
        },
      },
    ],
    { exitOnError: true, ctx: { error: false } },
  );

  const completed = await tasks.run();

  if (completed.error) {
    if (Array.isArray(completed.message)) {
      shell.echo(
        completed.message.reduce((acc, cur) => {
          return !acc
            ? `\n  ${chalk.redBright.bold(cur)}`
            : `${acc}\n  ${chalk.redBright.bold(cur)}`;
        }, ''),
      );
    } else {
      shell.echo(`\n  ${chalk.redBright.bold(completed.message + '!!!')}\n`);
    }
  }

  // shell.echo(completed);
})();
