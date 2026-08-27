/**
 * AgentQA 流程位置：描述一整个测试任务当前处于哪个业务阶段。
 * 使用场景：控制对话区、计划确认、执行界面和历史归档入口的展示状态。
 */
import { z } from "zod"

/**
  // 用户还在输入测试目标
  | "draft"
  // Agent正在生成计划
  | "planning"
  // 计划已生成，等待用户确认或补充
  | "awaiting_plan_approval"
  // 已确认计划，正在执行
  | "running"
  // 执行结束，报告已生成
  | "completed"
  // 本次任务归入历史记录
  | "archived";
 */
export const testTaskStatusSchema = z.enum([
  "draft",
  "planning",
  "awaiting_plan_approval",
  "running",
  "completed",
  "archived"
])

export type TestTaskStatus = z.infer<typeof testTaskStatusSchema>