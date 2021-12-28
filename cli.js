#!/usr/bin/env node

import { Listr } from 'listr2';
import shell from 'shelljs';
import meow from 'meow';
import chalk from 'chalk'; // eslint-disable-line
import cancelOrContinue from '@iyowei/cli-cancel-or-continue';
import UpdateNotifier from 'update-notifier';

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
import { CLI_FLAGS, ARG_BREAKPOINT } from './src/options/args.js';

import {
  updateGlobalConfigurations,
  getGlobalConfigurations,
  reset,
} from './src/options/global.js';
import makeOptions from './src/options/make.js';
import prerequisites from './src/prerequisites.js';

import getTasks from './src/tasks/index.js';

/* eslint func-names: 0 */
(async function () {
  // TODO: 骨架化

  // 必要工具检查
  prerequisites();

  const cli = meow(mainHelp, {
    importMeta: import.meta,
    flags: CLI_FLAGS,
  });

  UpdateNotifier({ pkg: cli.pkg }).notify();

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

  // console.log(opts);

  const tasks = new Listr(getTasks(opts.get(ARG_BREAKPOINT)), {
    exitOnError: true,
    ctx: { error: false, payload: opts },
  });

  const completed = await tasks.run();

  if (completed.error) {
    if (Array.isArray(completed.message)) {
      shell.echo(
        completed.message.reduce(
          (acc, cur) =>
            !acc
              ? `\n  ${chalk.redBright.bold(cur)}`
              : `${acc}\n  ${chalk.redBright.bold(cur)}`,
          '',
        ),
      );
    } else {
      shell.echo(`\n  ${chalk.redBright.bold(`${completed.message} !!!`)}\n`);
    }
  } else {
    shell.echo('');
  }

  // shell.echo(completed);
})();
