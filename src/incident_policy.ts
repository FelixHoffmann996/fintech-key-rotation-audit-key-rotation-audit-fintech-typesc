import { z } from "zod";

export const incidentInput = z.object({
  paymentEvent: z.object({
    reference: z.string().min(1),
    amountCents: z.number().int().positive(),
    status: z.enum(["settled", "declined"])
  }),
  confirmedLeak: z.boolean(),
  risk: z.enum(["low", "high"])
});

export type IncidentInput = z.infer<typeof incidentInput>;

export function incidentDecision(input: IncidentInput) {
  return {
    notify: input.paymentEvent.status === "declined" || input.risk === "high",
    graceHours: input.confirmedLeak || input.risk === "high" ? 0 : 1,
    auditReference: input.paymentEvent.reference
  };
}
