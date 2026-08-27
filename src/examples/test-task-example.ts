import type { TestTask } from "../domain/test-task.js";

export const testTaskExample: TestTask = {
  target: {
    goal: "检查新增红包的必填校验、正常提交和金额边界值",
  },
  status: "awaiting_plan_approval",
  plan: {
    summary: "覆盖正常、异常和边界场景",
    items: [
      {
        title: "检查必填项校验",
        scenario: "abnormal",
        action: "不填写表单，直接点击提交",
        expectedResult: "页面显示必填提示，并且不发起新增请求",
      },
      {
        title: "检查金额边界值",
        scenario: "boundary",
        action: "填写金额 0 后提交",
        expectedResult: "页面阻止提交，并提示金额必须大于 0",
      },
    ],
  },
  runs: [],
};
