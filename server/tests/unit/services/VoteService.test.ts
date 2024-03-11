import "reflect-metadata";
import {
  Signer,
} from "@solana/web3.js";
import {
  createVotingAccount,
  getAccountStateData,
  getAllProgramAccounts,
  getSigner,
  getVotingAccountBySeed,
  sendInstruction,
} from "../../../src/utils/program";
import { serialize } from "../../../src/utils/borsh";

describe("VoteService", () => {
  let signer: Signer;
  let accountSeed = "6ccfa0f4759af21d";

  beforeEach(() => {
    signer = getSigner();
  });

  it("should create vote topic", async () => {
    const title = "Best Crypto";
    const options = ["BTC", "ETH", "SOL"];

    const accountCreationData = await createVotingAccount(signer);
    accountSeed = accountCreationData?.seed!

    expect(accountCreationData?.accountPubKey).toBeDefined();

    const args = {CreateVoteTopicArgs: { title, options }};
    const instruction = serialize(args);
    const signature = await sendInstruction(instruction, accountCreationData?.accountPubKey!);

    expect(signature).toBeDefined();
  });

  it("should cast votes", async () => {
    const accountCreationData = await getVotingAccountBySeed(
      accountSeed
    );

    const title = "Best Crypto";
    const option = "BTC";

    const args = {
      CastVoteArgs: { title, option },
    };
    const instruction = serialize(args);
    const signature = await sendInstruction(instruction, accountCreationData);

    expect(signature).toBeDefined();
  });

  it("should send count instruction", async () => {
    const accountCreationData = await getVotingAccountBySeed(
      accountSeed
    );

    const title = "Best Crypto";
    const args = {
      GetVoteCountArgs: { title },
    };
    const instruction = serialize(args);
    const signature = await sendInstruction(instruction, accountCreationData);

    expect(signature).toBeDefined();
  });

  it("should fetch voting account data", async () => {
    const accountCreationData = await getVotingAccountBySeed(
      accountSeed
    );

    const accountData = (await getAccountStateData(accountCreationData)) as any;
    expect(accountData?.title).toBe("Best Crypto");
    expect(accountData?.options.length).toBe(3);
    expect(accountData?.options[0].votes).toBeGreaterThanOrEqual(1);
    expect(accountData?.options[1].votes).toBe(0);
    expect(accountData?.options[2].votes).toBe(0);
  });

  it("should fetch all voting topics", async () => {
    const accounts = await getAllProgramAccounts() as any;
    expect(accounts).toBeDefined();
    expect(accounts.length).toBeGreaterThanOrEqual(1);
  })
  
});
