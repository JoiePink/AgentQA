import { describe, expect, it } from "vitest";
import { attachTestPlan } from "../application/attach-test-plan.js";
import { createTestTask } from "../application/create-test-task.js";

describe("attachTestPlan", () => {
  it("合法计划被附加，任务变为 awaiting_plan_approval", () => {
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

    expect(newTask).toEqual({
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
      status: "awaiting_plan_approval",
      runs: [],
    });
  });

  it("空计划被 Zod 拒绝", () => {
    const task = createTestTask({
      goal: "检查新增红包",
    });

    const unQualifiedPlan = {
      summary: "空计划",
      items: [],
    };

    expect(() => attachTestPlan(task, unQualifiedPlan)).toThrow(
      "测试计划至少包含一个测试项",
    );
  });
});
