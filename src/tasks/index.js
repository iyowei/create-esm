import taskCreateGithubProject from './taskCreateGithubProject.js';
import taskCreateNpmPackage from './taskCreateNpmPackage.js';
import taskCopy from './taskCopy.js';
import taskPushCode from './taskPushCode.js';
import taskCreateChangelog from './taskCreateChangelog.js';
import taskPublish from './taskPublish.js';

export const TASK_ALIAS_REPO = 'repo';
export const TASK_ALIAS_NPM = 'npm';
export const TASK_ALIAS_COPY = 'copy';
export const TASK_ALIAS_PUSH = 'push';
export const TASK_ALIAS_CHANGELOG = 'changelog';
export const TASK_ALIAS_PUBLISH = 'publish';

export const TASKS = [
  TASK_ALIAS_REPO,
  TASK_ALIAS_NPM,
  TASK_ALIAS_COPY,
  TASK_ALIAS_PUSH,
  TASK_ALIAS_CHANGELOG,
  TASK_ALIAS_PUBLISH,
];

export const TASK_MODS = [
  {
    excute: taskCreateGithubProject.excute,
    name: taskCreateGithubProject.name,
    alias: TASK_ALIAS_REPO,
  },
  {
    excute: taskCreateNpmPackage.excute,
    name: taskCreateNpmPackage.name,
    alias: TASK_ALIAS_NPM,
  },
  {
    excute: taskCopy.excute,
    name: taskCopy.name,
    alias: TASK_ALIAS_COPY,
  },
  {
    excute: taskPushCode.excute,
    name: taskPushCode.name,
    alias: TASK_ALIAS_PUSH,
  },
  {
    excute: taskCreateChangelog.excute,
    name: taskCreateChangelog.name,
    alias: TASK_ALIAS_CHANGELOG,
  },
  {
    excute: taskPublish.excute,
    name: taskPublish.name,
    alias: TASK_ALIAS_PUBLISH,
  },
];

export function getTasksList(breaker) {
  const BREAKPOINT_INDEX = TASKS.indexOf(breaker);

  if (BREAKPOINT_INDEX !== -1) {
    // BREAKPOINT 有效

    if (BREAKPOINT_INDEX === 0) {
      // 第一个
      return TASKS.slice(0, 1);
    }

    if (BREAKPOINT_INDEX === TASKS.length - 1) {
      // 最后一个
      return TASKS;
    }

    // 中间
    return TASKS.slice(0, BREAKPOINT_INDEX + 1);
  }

  // BREAKPOINT 无效
  return TASKS;
}

export default function getTasks(breaker) {
  const LIST = getTasksList(breaker);

  const FILTERED = TASK_MODS.filter((cur) => LIST.includes(cur.alias)).map(
    (cur) => ({
      title: cur.name,
      task: async (ctx, task) => {
        await cur.excute({ ctx, task });
      },
    }),
  );

  return FILTERED;
}
