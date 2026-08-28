import { testPlanSchema } from "../domain/test-plan.js";
import type { TestTask } from "../domain/test-task.js";
import { randomUUID } from "node:crypto";

export function startTestRun(task: TestTask): TestTask {
  if (task.status !== "awaiting_plan_approval") {
    throw new Error("只有等待计划确认的任务才能启动测试运行");
  }

  const plan = testPlanSchema.parse(task.plan);

  return {
    ...task,
    plan,
    status: "running",
    runs: [
      ...task.runs,
      {
        id: randomUUID(),
        status: "queued",
        results: [],
      },
    ],
  };
}
