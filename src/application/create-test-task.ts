import type { TestTask } from "../domain/test-task.js";
import { testTargetSchema } from "../domain/test-target.js";

/**
 * 用户在输入框中输入测试目标并发送后，创建一条状态为planning的测试记录
 * @param input 
 * @returns 
 */
export function createTestTask(input: unknown): TestTask {
  const target = testTargetSchema.parse(input);

  return {
    target,
    status: "planning",
    runs: [],
  };
}
