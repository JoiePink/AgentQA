import { describe, expect, it } from "vitest";
import { createTestTask } from "../application/create-test-task.js";

describe("createTestTask", () => {
  it("根据合法目标创建planning状态的任务", () => {
    const task = createTestTask({
      goal: "   检查新增红包",
    });

    expect(task).toEqual({
      target: {
        goal: "检查新增红包",
      },
      status: "planning",
      runs: [],
    });
  });

  it("拒绝空白测试目标", () => {
    expect(() =>
      createTestTask({
        goal: "   ",
      }),
    ).toThrow("测试目标不能为空");
  });
});
