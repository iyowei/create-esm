import pkg from '@npmcli/package-json';
import shell from 'shelljs';
import { writeNpmRc } from '@iyowei/create-templates';
import isEmpty from 'lodash/isEmpty.js';

export const TASK_NAME_CREATE_NPM_PACKAGE = '创建项目';

// TODO: 使用 "模板方法模式" 组织代码
export default async function taskCreateNpmPackage({ ctx, task, opts }) {
  if (!ctx.error) {
    const PART_NAME = '切换到新创建好的项目';

    task.title = PART_NAME;

    if (shell.cd(opts.get('newProjectPath')).code !== 0) {
      ctx.error = true;
      ctx.message = `"${TASK_NAME_CREATE_NPM_PACKAGE}" 任务在 "${PART_NAME}" 环节出错`;
    }
  }

  if (!ctx.error) {
    const PART_NAME = '生成 package.json';

    task.title = PART_NAME;

    const excuted = shell.exec(
      isEmpty(opts.get('namespace'))
        ? 'npm init -y'
        : `npm init --scope=${opts.get('namespace')} -y`,
      {
        silent: true,
      },
    );

    if (excuted.code !== 0) {
      ctx.error = true;
      ctx.message = [
        `"${TASK_NAME_CREATE_NPM_PACKAGE}" 任务在 "${PART_NAME}" 环节出错,`,
      ].concat(excuted.stderr.split('\n'));
    } else {
      const pkgIns = await pkg.load(opts.get('newProjectPath'));

      const TMP = {
        // 包
        type: 'module',
        exports: opts.get('pkgExports').relativePath,
        main: opts.get('pkgExports').bareRelativePath,
        files: opts.get('pkgFiles'),
        engines: {
          node: '>=12.20.0',
        },

        // 脚手架
        scripts: {
          format:
            "npx prettier '**/*.{js,mjs,json,md}' --write --loglevel error",
          lint: 'npx eslint **/*.js',
        },

        // 基本信息
        description: opts.get('description'),

        // 公开
        private: false,
        publishConfig: {
          access: 'public',
        },
        keywords: ['iyowei'],
        license: 'MIT',
      };

      if (opts.get('tdd')) {
        TMP.scripts.test = "npx mocha '**/*.+(spec|test).js'";
      }

      pkgIns.update(TMP);
      await pkgIns.save();

      delete pkgIns.content.author;
      await pkgIns.save();
    }
  }

  if (!ctx.error) {
    const PART_NAME = '生成 .npmrc';

    task.title = PART_NAME;

    // 读取 .npmrc 模板，填入数据，写到新建项目中
    await writeNpmRc({
      output: opts.get('prints').npmrc.output,
      data: { namespace: opts.get('namespace') },
    });
  }

  if (!ctx.error) {
    const DEPs = opts.get('dependencies');

    if (DEPs.length !== 0) {
      const PART_NAME = '安装生产依赖';

      task.title = PART_NAME;

      shell.exec(`pnpm add ${DEPs.join(' ')}`, { silent: true });
    }

    const DevDEPs = opts.get('devDependencies');

    if (DevDEPs.length !== 0) {
      const PART_NAME = '安装开发依赖';

      task.title = PART_NAME;

      shell.exec(`pnpm add ${DevDEPs.join(' ')} -D`, { silent: true });
    }
  }

  if (ctx.error) {
    task.skip('未能成功初始化 NPM');
  } else {
    task.title = '成功初始化 NPM';
  }
}
