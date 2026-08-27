/**
 * AgentQA 流程位置：执行器完成或跳过一个测试项后产生的结构化执行结果。
 * 使用场景：记录实际结果、通过状态和证据，供执行进度与最终报告统一使用。
 */
import { z } from "zod";
import { evidenceSchema } from "./evidence.js";
import { testItemSchema } from "./test-item.js";

/**
    "passed" // 实际结果符合expectedResult
    "failed" // 执行完成，但实际结果不符合预期
    "blocked" // 无法继续执行，例如登录失效、页面打不开
    "skipped"; // 这次没有执行，例如依赖的前置测试项失效
 */
export const testItemResultStatusSchema = z.enum([
  "passed",
  "failed",
  "blocked",
  "skipped",
]);

export const testItemResultSchema = z.object({
  item: testItemSchema,
  status: testItemResultStatusSchema,
  // 执行器实际观察到的结果，不能由Agent凭空编造
  actualResult: z.string().trim().min(1, "实际结果不能为空"),
  // 一个结果可能同时有截图、网络记录和控制台日志
  evidence: z.array(evidenceSchema),
});

export type TestItemResultStatus = z.infer<typeof testItemResultStatusSchema>
export type TestItemResult = z.infer<typeof testItemResultSchema>
