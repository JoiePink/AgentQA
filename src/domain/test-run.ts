/**
 * AgentQA 流程位置：用户确认测试计划后，执行器创建的一次独立测试运行。
 * 使用场景：记录运行状态、各测试项结果和本次运行生成的报告；重跑会创建新的 TestRun。
 */
import { z } from "zod";
import { testItemResultSchema } from "./test-item-result.js";
import { testReportSchema } from "./test-report.js";

/**
  // 运行已创建，等待开始
  | "queued"
  // 正在执行
  | "running"
  // 用户暂停，可继续
  | "paused"
  // 全部可执行测试项已完成
  | "completed"
  // 用户结束运行，生成部分结果
  | "stopped"
  // 环境中断，例如浏览器关闭或登录失效
  | "interrupted"
  // AgentQA自身发生故障
  | "failed";
 */
export const testRunStatusSchema = z.enum([
  "queued",
  "running",
  "paused",
  "completed",
  "stopped",
  "interrupted",
  "failed",
]);

export const testRunSchema = z.object({
  id: z.string().trim().min(1, "运行记录Id不能为空"),
  status: testRunStatusSchema,
  results: z.array(testItemResultSchema),
  report: testReportSchema.optional(),
});

export type TestRunStatus = z.infer<typeof testRunStatusSchema>;
export type TestRun = z.infer<typeof testRunSchema>;
