/**
 * AgentQA 流程位置：创建测试任务时，用户在对话输入框提交的原始测试目标。
 * 使用场景：前端提交目标后，后端在保存任务和调用规划 Agent 前校验这份数据。
 */
import { z } from "zod";

export const testTargetSchema = z.object({
  // 用户在首次对话框输入的测试目标 
  // goal 必须是字符串，去掉首尾空格后，至少还要有一个字符。
  goal: z.string().trim().min(1, "测试目标不能为空"),
});

// 让 TypeScript从 Schema 自动推导类型。
export type TestTarget = z.infer<typeof testTargetSchema>;
