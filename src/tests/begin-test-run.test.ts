import { describe, expect, it } from "vitest";
import { attachTestPlan } from "../application/attach-test-plan.js";
import { beginTestRun } from "../application/begin-test-run.js";
import { createTestTask } from "../application/create-test-task.js";
import { startTestRun } from "../application/start-test-run.js";

describe("beginTestRun", () => {
  it("将指定的 queued 运行变为 running", () => {
    // 创建一个状态为planning的task
    const task = createTestTask({
      goal: "检查新增红包",
    });

    // 模拟agent生成的测试计划
    const qualifiedPlan = {
      summary: "验证红包金额",
      items: [
        {
          title: "检查金额为0",
          scenario: "boundary",
          action: "填写金额 0 后提交",
          expectedResult: "阻止提交并提示金额必须大于 0",
        },
      ],
    };

    // 把测试计划放到task中，并把任务推进到“等待人工确认计划”
    const awaitingTask = attachTestPlan(task, qualifiedPlan);

    // 人工确认后，创建一条 queued 的运行记录。
    const startedTask = startTestRun(awaitingTask);
    const queuedRun = startedTask.runs.find((run) => run.status === "queued");

    // 本测试的前置步骤必定创建 queued 运行；否则测试应明确失败。
    if (!queuedRun) {
      throw new Error("启动测试后应创建一条 queued 运行记录");
    }

    const newTask = beginTestRun(startedTask, queuedRun.id);

    expect(newTask.runs).toEqual([
      {
        id: queuedRun.id,
        status: "running",
        results: [],
      },
    ]);
  });

  it("只有进行中的任务才能启动测试运行", () => {
    // 此时task的status为planning
    const task = createTestTask({
      goal: "检查新增红包",
    });

    expect(() => beginTestRun(task, "run-1")).toThrow(
      "只有进行中的任务才能启动测试运行",
    );
  });

  it("处理runId不存在的情况", () => {
    const task = createTestTask({
      goal: "检查新增红包",
    });

    // 模拟agent生成的测试计划
    const qualifiedPlan = {
      summary: "验证红包金额",
      items: [
        {
          title: "检查金额为0",
          scenario: "boundary",
          action: "填写金额 0 后提交",
          expectedResult: "阻止提交并提示金额必须大于 0",
        },
      ],
    };

    // 把测试计划放到task中，并把任务推进到“等待人工确认计划”
    const awaitingTask = attachTestPlan(task, qualifiedPlan);

    // 人工确认后，创建一条 queued 的运行记录。
    const startedTask = startTestRun(awaitingTask);

    const runId = "hello";

    expect(() => beginTestRun(startedTask, runId)).toThrow(
      "找不到指定测试运行",
    );
  });

  it("只有 queued 运行才能启动", () => {
    const task = createTestTask({
      goal: "检查新增红包",
    });
    const awaitingTask = attachTestPlan(task, {
      summary: "验证红包金额",
      items: [
        {
          title: "检查金额为0",
          scenario: "boundary",
          action: "填写金额 0 后提交",
          expectedResult: "阻止提交并提示金额必须大于 0",
        },
      ],
    });
    const startedTask = startTestRun(awaitingTask);
    const queuedRun = startedTask.runs[0];

    // 第一次启动后，这条运行已是 running，不能被再次启动。
    const runningTask = beginTestRun(startedTask, queuedRun.id);

    expect(() => beginTestRun(runningTask, queuedRun.id)).toThrow(
      "只有等待执行的测试运行才能启动",
    );
  });
});
