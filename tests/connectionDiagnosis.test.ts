import test from "node:test";
import assert from "node:assert/strict";
import { diagnoseGetInfoFailure } from "../src/services/accounts/connectionDiagnosis";

test("respons HTML/403 dibaca sebagai diblokir", () => {
  assert.equal(diagnoseGetInfoFailure("Unexpected token '<', \"<html><h1>403\" is not valid JSON"), "BLOCKED_OR_NON_JSON");
  assert.equal(diagnoseGetInfoFailure("HTTP Error: 403"), "BLOCKED_OR_NON_JSON");
});
test("timeout/jaringan", () => {
  assert.equal(diagnoseGetInfoFailure("This operation was aborted"), "NETWORK_OR_TIMEOUT");
  assert.equal(diagnoseGetInfoFailure("fetch failed"), "NETWORK_OR_TIMEOUT");
});
test("penolakan eksplisit Indodax", () => {
  assert.equal(diagnoseGetInfoFailure("Invalid API key"), "REJECTED_BY_INDODAX");
  assert.equal(diagnoseGetInfoFailure("Invalid signature"), "REJECTED_BY_INDODAX");
});
