import { z } from "zod";
import { IncidentClient } from "./infrai_incident_client.js";
import { incidentDecision, type IncidentInput } from "./incident_policy.js";

const createdKey = z.object({ id: z.string().min(1) }).passthrough();

export async function runIncident(client: IncidentClient, input: IncidentInput) {
  const decision = incidentDecision(input);
  const operationId = crypto.randomUUID();
  // One credential and base URL cover account controls and audit logs.
  const temporary = createdKey.parse(await client.call("POST", "/v1/account/keys/create", {
    name: `incident-${operationId}`,
    idempotency_key: operationId
  }));
  const id = encodeURIComponent(temporary.id);
  try {
    await client.call("POST", `/v1/account/keys/suspected_compromise/${id}`, {
      confirmed_leak: input.confirmedLeak,
      auto_rotate: false
    });
    await client.call("POST", `/v1/account/keys/rotate/${id}`, {
      grace_hours: decision.graceHours,
      idempotency_key: crypto.randomUUID()
    });
    const logs = await client.call("GET", "/v1/logs/search");
    const entries = Array.isArray(logs) ? logs :
      logs && typeof logs === "object" && "items" in logs && Array.isArray(logs.items) ? logs.items : [];
    const evidence = entries.filter(entry => JSON.stringify(entry).includes(temporary.id));
    return {
      temporaryKeyId: temporary.id,
      auditReference: decision.auditReference,
      notify: decision.notify,
      graceHours: decision.graceHours,
      matchingLogEntries: evidence
    };
  } finally {
    await client.call("DELETE", `/v1/account/keys/revoke/${id}`);
  }
}
