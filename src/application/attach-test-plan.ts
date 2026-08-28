/**
 * 把Agent生成的测试计划安全的放进已有任务，并把任务推进到“等待人工确认计划”的一步
 */
import type { TestTask } from "../domain/test-task.js";
import { testPlanSchema } from "../domain/test-plan.js";

// task: TestTask：已经创建好的任务，正常情况下状态是planning
// planInput: unknown：Agent的外部返回值，暂时不信任它的结构
// 返回TestTask：成功后仍然是一个完整任务
export function attachTestPlan(task: TestTask, planInput: unknown): TestTask {
  // 校验计划
  const plan = testPlanSchema.parse(planInput);
  // 创建并返回一个新任务对象
  return {
    // 复制原有目标，已有运行记录等数据
    ...task,
    // 写入已校验的测试计划
    plan,
    status: "awaiting_plan_approval",
  };
}
