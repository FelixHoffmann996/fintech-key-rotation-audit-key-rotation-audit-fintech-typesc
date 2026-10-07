import { IncidentClient } from "./infrai_incident_client.js";
import { incidentInput } from "./incident_policy.js";
import { runIncident } from "./incident_workflow.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY");
const input = incidentInput.parse({
  paymentEvent: { reference: "payment-audit-001", amountCents: 12500, status: "declined" },
  confirmedLeak: true,
  risk: "high"
});
console.log(JSON.stringify(await runIncident(new IncidentClient(key), input), null, 2));
