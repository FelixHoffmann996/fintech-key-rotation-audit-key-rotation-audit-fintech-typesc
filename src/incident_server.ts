import { createServer } from "node:http";
import { ZodError } from "zod";
import { IncidentClient, InfraiError } from "./infrai_incident_client.js";
import { incidentInput } from "./incident_policy.js";
import { runIncident } from "./incident_workflow.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY");
const client = new IncidentClient(key);

createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (request.method !== "POST" || request.url !== "/incident") {
    response.writeHead(404).end(JSON.stringify({ error: "Not found" }));
    return;
  }
  try {
    let raw = "";
    for await (const chunk of request) {
      raw += chunk;
      if (raw.length > 16384) throw new Error("Body too large");
    }
    const input = incidentInput.parse(JSON.parse(raw));
    const result = await runIncident(client, input);
    response.writeHead(200).end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof ZodError || error instanceof SyntaxError ? 400
      : error instanceof InfraiError ? (error.status >= 400 && error.status < 500 ? error.status : 502)
      : 502;
    response.writeHead(status).end(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed" }));
  }
}).listen(Number(process.env.PORT ?? 3000));
