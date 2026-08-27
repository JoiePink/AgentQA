/**
 * AgentQA 流程位置：一次测试运行结束后生成的用户可读报告
 * 使用场景：根据测试项结果汇总整体结论，并展示在对话结果区和完整报告中
 */

import { z } from "zod";

export const testReportSchema = z.object({
  summary: z.string().trim().min(1, "报告摘要不能为空"),
});

export type TestReport = z.infer<typeof testReportSchema>;
