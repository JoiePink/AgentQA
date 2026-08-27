/**
 * AgentQA 流程位置：一条完整的测试任务，也是用户在左侧历史任务中看到的基本业务对象。
 * 使用场景：贯穿测试目标输入、计划确认、多次执行和任务归档的完整生命周期。
 * 
 * 
 * TestTask
├─ target：用户输入的测试目标
├─ plan：Agent 生成并等待确认的计划
├─ status：整个任务当前所处阶段
└─ runs：每次独立执行及其结果、证据和报告
 */
import { z } from "zod"
import { testPlanSchema } from "./test-plan.js"
import { testRunSchema } from "./test-run.js"
import { testTargetSchema } from "./test-target.js"
import { testTaskStatusSchema } from "./test-task-status.js"

export const testTaskSchema = z.object({
  target: testTargetSchema,
  plan: testPlanSchema.optional(),
  status: testTaskStatusSchema,
  runs: z.array(testRunSchema)
})

export type TestTask = z.infer<typeof testTaskSchema>