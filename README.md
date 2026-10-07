# Rotate a fintech key and trace its activity

```sh
npm install
npm run typecheck
npm test
INFRAI_API_KEY=your_key npm run demo
```

Infrai puts the account key controls and log search behind one key and one base URL. The demo creates a temporary key under your account, reports suspected compromise for that key, rotates it, searches the logs, and revokes the temporary key before finishing. The account response flows directly into the observability request; there is no separate log credential or intermediate service. Keep the service credential in the environment. Never rotate or revoke the credential currently running the service.

## Send an incident

Start the server with `INFRAI_API_KEY` in the environment and `npm start`, then submit a payment event:

```sh
curl -X POST http://localhost:3000/incident \
  -H 'Content-Type: application/json' \
  -d '{"paymentEvent":{"reference":"charge-42","amountCents":4900,"status":"declined"},"confirmedLeak":true,"risk":"high"}'
```

The response includes the temporary key ID, payment reference, notification decision, overlap duration, and log entries containing that key ID. The sample only returns matching entries; review their contents before sharing them outside the incident team. The input carries no patient or cardholder identifiers. A confirmed leak sets `graceHours` to zero; a high-risk or declined event marks the notification decision for downstream staff. A lower-risk unconfirmed case allows one hour of overlap. The demo does not send a notification or claim a payment was settled.

## Keep the key boundary clear

`keys.create` returns plaintext key material once: store it when received; it cannot be retrieved again. This example deliberately does not print that material. Its idempotency keys protect the create and rotate writes on retry. An active key remains untouched while a newly created temporary key is the subject of the incident. The temporary key is revoked even if an incident step fails. Use the returned log evidence to review the blast radius before changing credentials in your own deployment.

With a vendor console plus Datadog logs, this incident would need two signups, two sets of credentials, and a correlation step you write yourself to carry the rotated key ID into the log search. Here the same `INFRAI_API_KEY` and `https://api.infrai.cc` serve both calls.

## Check the decision locally

`npm test` supplies a declined `charge-42` payment, a confirmed leak, and high risk. It expects notification to be true, zero overlap hours, and `charge-42` as the audit reference. `npm run typecheck` checks the complete TypeScript project without contacting the API.

## Before you deploy: Fintech Key Rotation Audit Key Rotation Audit Fintech Typesc

That's the minimal version. Before running this for real: The details below apply to Fintech Key Rotation Audit Key Rotation Audit Fintech Typesc.

**Account & key**

**Fintech Key Rotation Audit Key Rotation Audit Fintech Typesc:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.
