
import { describe, expect, it } from "vitest";

// Obtain SDK helpers (tx) and Clarity constructors (Cl) via dynamic import
async function getEnv() {
  const sdk = await import("@hirosystems/clarinet-sdk");
  const stacks = await import("@stacks/transactions");
  const tx = sdk.tx;
  const Cl = stacks.Cl;
  return { tx, Cl };
}

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("rewards-ledger contract", () => {
  it("simnet is initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("get-reward returns 0 for a new user", async () => {
    const { Cl } = await getEnv();
    const { result } = simnet.callReadOnlyFn(
      "rewards-ledger",
      "get-reward",
      [Cl.standardPrincipal(wallet1)],
      wallet1
    );

    expect(result).toBeUint(0);
  });

  it("only admin can credit rewards and balances update", async () => {
    const { tx, Cl } = await getEnv();

    // admin credits wallet1
    const block = await simnet.mineBlock([
      tx.callPublicFn("rewards-ledger", "credit-reward", [Cl.standardPrincipal(wallet1), Cl.uint(100)], deployer),
    ]);

    expect(block.receipts[0].result).toEqual("(ok true)");

    // credit accumulates
    await simnet.mineBlock([
      tx.callPublicFn("rewards-ledger", "credit-reward", [Cl.standardPrincipal(wallet1), Cl.uint(50)], deployer),
    ]);

    const { result } = simnet.callReadOnlyFn(
      "rewards-ledger",
      "get-reward",
      [Cl.standardPrincipal(wallet1)],
      wallet1
    );

    expect(result).toBeUint(150);

    // non-admin cannot credit
    const failBlock = await simnet.mineBlock([
      tx.callPublicFn("rewards-ledger", "credit-reward", [Cl.standardPrincipal(wallet2), Cl.uint(10)], wallet1),
    ]);

    expect(failBlock.receipts[0].result).toEqual("(err u400)");
  });

  it("claim-reward reverts when insufficient and succeeds when enough", async () => {
    const { tx: tx2, Cl: Cl2 } = await getEnv();

    // ensure wallet2 has no reward
    let ro = simnet.callReadOnlyFn("rewards-ledger", "get-reward", [Cl2.standardPrincipal(wallet2)], wallet2);
    expect(ro.result).toBeUint(0);

    // admin credits wallet2 with 80
    await simnet.mineBlock([
      tx2.callPublicFn("rewards-ledger", "credit-reward", [Cl2.standardPrincipal(wallet2), Cl2.uint(80)], deployer),
    ]);

    // attempt to claim more than balance -> u401
    const failClaim = await simnet.mineBlock([
      tx2.callPublicFn("rewards-ledger", "claim-reward", [Cl2.uint(100)], wallet2),
    ]);
    expect(failClaim.receipts[0].result).toEqual("(err u401)");

    // valid claim
    const okClaim = await simnet.mineBlock([
      tx2.callPublicFn("rewards-ledger", "claim-reward", [Cl2.uint(30)], wallet2),
    ]);
    expect(okClaim.receipts[0].result).toEqual("(ok true)");

    const { result: after } = simnet.callReadOnlyFn(
      "rewards-ledger",
      "get-reward",
      [Cl2.standardPrincipal(wallet2)],
      wallet2
    );
    expect(after).toBeUint(50);
  });
});
