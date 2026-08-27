/**
 * AgentQA 流程位置：浏览器执行测试时采集的截图、网络记录和控制台日志引用。
 * 使用场景：执行器保存原始证据后，用该结构把证据关联到测试项结果和报告。
 */
import { z } from "zod";

// 截图、网络记录或控制台日志
export const evidenceTypeSchema = z.enum(["screenshot", "network", "console"]);
export const evidenceSchema = z.object({
  type: evidenceTypeSchema,
  // 用户可读的名称，例如 “金额为0时的提交截图”
  label: z.string().trim().min(1,"证据名称不能为空"),
  // 证据实际存放位置，未来可以是本地文件路径或AgentQA的证据访问地址
  uri: z.string().trim().min(1,"证据地址不能为空"),
});

export type EvidenceType = z.infer<typeof evidenceTypeSchema>
export type Evidence = z.infer<typeof evidenceSchema>
