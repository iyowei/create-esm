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

import {
  CLI_FLAGS,
  OPTION_BREAKPOINT,
  OPTION_HELP,
} from './src/options/options.js';

import {
  updatePersistentConfigurations,
  getPersistentConfigurations,
  resetPersistentConfigurations,
} from './src/options/persistent.js';

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
    if (cli.flags[OPTION_HELP]) {
      shell.echo(setupHelp);
      return;
    }

    const SETUP_KEY = cli.input[1];
    const SETUP_VALUE = cli.input[2];

    updatePersistentConfigurations(SETUP_KEY, SETUP_VALUE);

    shell.echo(getPersistentConfigurations());

    return;
  }

  // 二级指令：查看默认配置
  if (cli.input[0] === COMMAND_DEFAULTS) {
    if (cli.flags[OPTION_HELP]) {
      shell.echo(defaultsHelp);
      return;
    }

    shell.echo(getPersistentConfigurations());

    return;
  }

  // 二级指令：清空
  if (cli.input[0] === COMMAND_RESET) {
    if (cli.flags[OPTION_HELP]) {
      shell.echo(resetHelp);
      return;
    }

    resetPersistentConfigurations();
    shell.echo(getPersistentConfigurations());

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

  const tasks = new Listr(getTasks(opts.get(OPTION_BREAKPOINT)), {
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
