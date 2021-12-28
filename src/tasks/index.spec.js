import assert from 'assert';
import {
  getTasksList,
  TASK_ALIAS_COPY,
  TASK_ALIAS_REPO,
  TASK_ALIAS_PUBLISH,
  TASKS,
} from './index.js';

describe('getTasksList()', () => {
  it(`breaker: "${TASK_ALIAS_COPY}"`, () => {
    assert.deepStrictEqual(getTasksList(TASK_ALIAS_COPY), [
      'repo',
      'npm',
      'copy',
    ]);
  });

  it(`breaker: "${TASK_ALIAS_PUBLISH}"`, () => {
    assert.deepStrictEqual(getTasksList(TASK_ALIAS_PUBLISH), TASKS);
  });

  it(`breaker: "${TASK_ALIAS_REPO}"`, () => {
    assert.deepStrictEqual(getTasksList(TASK_ALIAS_REPO), ['repo']);
  });
});
