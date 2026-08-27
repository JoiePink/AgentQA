import { describe, expect, it } from "vitest";
import { testTaskSchema } from "../domain/test-task.js";
import { testTaskExample } from "../examples/test-task-example.js";

describe("testTaskSchema", () => {
  it("接受结构完整的测试任务", () => {
    const result = testTaskSchema.safeParse(testTaskExample);
    expect(result.success).toBe(true);
  });

  it("拒绝包含未知场景类型的测试任务", () => {
    const invalidTask = {
      ...testTaskExample,
      plan: {
        ...testTaskExample.plan!,
        items: [
          {
            ...testTaskExample.plan!.items[0],
            scenario: "error",
          },
          ...testTaskExample.plan!.items.slice(1)
        ],
      },
    };

    const result = testTaskSchema.safeParse(invalidTask);

    expect(result.success).toBe(false);
  });
});
