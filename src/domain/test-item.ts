/**
 * AgentQA 流程位置：规划 Agent 生成测试计划时，计划中的单个可执行测试项。
 * 使用场景：校验 Agent 返回的测试项，并在计划确认页展示操作、场景和预期结果。
 */
import { z } from "zod";
export const testScenarioSchema = z.enum(["normal", "abnormal", "boundary"]);

export const testItemSchema = z.object({
  // 测试项名称：告诉用户和执行器“本次要验证什么功能”。
  title: z.string().trim().min(1, "测试项名称不能为空"),
  // 测试场景：正常流程、异常输入或边界条件三选一。
  scenario: testScenarioSchema,
  // 测试操作：执行器需要在被测系统中实际完成的步骤。
  action: z.string().trim().min(1, "测试操作不能为空"),
  // 预期结果：完成操作后，系统应当表现出的正确结果。
  expectedResult: z.string().trim().min(1, "预期结果不能为空"),
});

export type TestScenario = z.infer<typeof testScenarioSchema>
export type TestItem = z.infer<typeof testItemSchema>
