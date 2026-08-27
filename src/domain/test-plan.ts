/**
 * AgentQA 流程位置：用户提交测试目标后，规划 Agent 返回的完整结构化测试计划。
 * 使用场景：校验 Agent 输出，并在用户确认或补充计划后作为后续执行依据。
 */
import { z } from "zod";
import { testItemSchema } from "./test-item.js";

export const testPlanSchema = z.object({
  summary: z.string().trim().min(1, "计划摘要不能为空"),
  items: z.array(testItemSchema).min(1, "测试计划至少包含一个测试项"),
});

export type TestPlan = z.infer<typeof testPlanSchema>;
