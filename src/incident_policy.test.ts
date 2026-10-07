import assert from "node:assert/strict";
import { test } from "node:test";
import { incidentDecision, incidentInput } from "./incident_policy.js";

test("confirmed leak on a declined payment requires immediate rotation and notification", () => {
  const input = incidentInput.parse({
    paymentEvent: { reference: "charge-42", amountCents: 4900, status: "declined" },
    confirmedLeak: true,
    risk: "high"
  });
  assert.deepEqual(incidentDecision(input), {
    notify: true, graceHours: 0, auditReference: "charge-42"
  });
});
