import { describe, it, expect } from "vitest";
import { attachTestPlan } from "../application/attach-test-plan.js";
import { createTestTask } from "../application/create-test-task.js";
import { startTestRun } from "../application/start-test-run.js";

describe("startTestRun", () => {
  it("开始运行测试", () => {
    const task = createTestTask({
      goal: "检查新增红包",
    });

    const qualifiedPlan = {
      summary: "验证红包金额",
      items: [
        {
          title: "检查金额为 0",
          scenario: "boundary",
          action: "填写金额 0 后提交",
          expectedResult: "阻止提交并提示金额必须大于 0",
        },
      ],
    };

    const newTask = attachTestPlan(task, qualifiedPlan);

    const newRunTask = startTestRun(newTask);

    expect(newRunTask).toEqual({
      target: {
        goal: "检查新增红包",
      },
      plan: {
        summary: "验证红包金额",
        items: [
          {
            title: "检查金额为 0",
            scenario: "boundary",
            action: "填写金额 0 后提交",
            expectedResult: "阻止提交并提示金额必须大于 0",
          },
        ],
      },
      status: "running",
      runs: [
        {
          // 断言这个 id 的值“只要是字符串就算通过”
          id: expect.any(String),
          status: "queued",
          results: [],
        },
      ],
    });
  });

  it("非法状态不能启动", () => {
    const task = createTestTask({
      goal: "检查新增红包",
    });

    expect(() => startTestRun(task)).toThrow(
      "只有等待计划确认的任务才能启动测试运行",
    );
  });

  it("启动新运行时保留历史运行记录", () => {
    const task = attachTestPlan(
      createTestTask({
        goal: "检查新增红包",
      }),
      {
        summary: "验证红包金额",
        items: [
          {
            title: "检查金额为 0",
            scenario: "boundary",
            action: "填写金额 0 后提交",
            expectedResult: "阻止提交并提示金额必须大于 0",
          },
        ],
      },
    );

    const taskWithHistory = {
      ...task,
      runs: [
        {
          id: "run-old",
          status: "completed" as const,
          results: [],
        },
      ],
    };

    const startedTask = startTestRun(taskWithHistory);

    expect(startedTask.runs).toEqual([
      {
        id: "run-old",
        status: "completed",
        results: [],
      },
      {
        id: expect.any(String),
        status: "queued",
        results: [],
      },
    ]);
  });
});
