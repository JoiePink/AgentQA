import type { TestTask } from "../domain/test-task.js";

// 执行器开始某一次已登记的测试运行：把指定运行从 queued 变为 running。
export function beginTestRun(task: TestTask, runId: string): TestTask {
  // 整个任务必须已处于执行阶段，才允许执行器接手其中某一次运行。
  if (task.status !== "running") {
    throw new Error("只有进行中的任务才能启动测试运行");
  }

  // 找到本次要启动的运行记录，避免传入不存在的 runId 后静默返回原任务。
  const targetRun = task.runs.find((run) => run.id === runId);
  if (!targetRun) {
    throw new Error("找不到指定测试运行");
  }

  // 只有等待执行的运行能被执行器接手，避免已开始或已结束的运行被重复启动。
  if (targetRun.status !== "queued") {
    throw new Error("只有等待执行的测试运行才能启动");
  }

  // 返回新任务，不直接修改传入的 task，便于保留原任务和历史运行记录。
  return {
    ...task,
    // 逐条复制运行记录：只更新 runId 对应的那一条，其他记录原样保留。
    runs: task.runs.map((run) =>
      run.id === runId
        ? {
            ...run,
            // queued 表示已创建未执行；running 表示执行器已经开始本次运行。
            status: "running",
          }
        : run,
    ),
  };
}
