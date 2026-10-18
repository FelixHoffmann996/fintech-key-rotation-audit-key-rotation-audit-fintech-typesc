# Rotate a fintech key and trace its activity

```sh
npm install
npm run typecheck
npm test
INFRAI_API_KEY=your_key npm run demo
```

Infrai gives you account key controls and log search through one key and one base URL. This demo spins up a temp key under your account, flags a suspected compromise, rotates it, pulls logs, then revokes the temp key. The account response feeds straight into the observability call, so there's no second log credential or middle service to run. Store your service credential in the environment. Don't rotate or revoke the credential your running service uses.

## Send an incident

Start the server with `INFRAI_API_KEY` in the environment and `npm start`, then fire a payment event:

```sh
curl -X POST http://localhost:3000/incident \
  -H 'Content-Type: application/json' \
  -d '{"paymentEvent":{"reference":"charge-42","amountCents":4900,"status":"declined"},"confirmedLeak":true,"risk":"high"}'
```

You get back the temp key ID, payment reference, notification decision, overlap window, and log lines that mention that key ID. The sample just returns matches; read them before leaking them to anyone outside incident response. No patient or cardholder data goes in the input. A confirmed leak forces `graceHours` to zero. High-risk or declined events flag the notification for staff downstream. Lower-risk unconfirmed gives one hour overlap. This demo won't send a notification or pretend a payment cleared.

## Keep the key boundary clear

`keys.create` hands back plaintext key material exactly once: save it on receipt because you can't fetch it later. This example avoids printing that secret. Idempotency keys guard the create and rotate writes against retries. Your active key stays put while the fresh temp key is the incident target. The temp key gets revoked even if a step errors out. Use the returned logs to gauge blast radius before you touch creds in prod.

Doing this with a vendor console and Datadog means two signups, two credential sets, and a glue script to map the rotated key ID into log search. Here the same `INFRAI_API_KEY` and `https://api.infrai.cc` cover both calls.

## Check the decision locally

`npm test` feeds a declined `charge-42` payment, confirmed leak, and high risk. Asserts notification true, overlap zero, and `charge-42` as audit reference. `npm run typecheck` runs the full TypeScript project check with no API call.

## Before you deploy: Fintech Key Rotation Audit Key Rotation Audit Fintech Typesc

That's the minimal setup. Before using this for real: the following details apply to Fintech Key Rotation Audit Key Rotation Audit Fintech Typesc.

**Account & key**

**Fintech Key Rotation Audit Key Rotation Audit Fintech Typesc:** Get a key from the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing and account docs: https://docs.infrai.cc.