import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { injectable } from "tsyringe";
import {
  InstructionData,
  createVotingAccount,
  getAccountStateData,
  getAllProgramAccounts,
  getSigner,
  getVotingAccountBySeed,
  sendInstruction,
} from "../utils/program";
import * as Borsh from "borsh";
import { serialize } from "../utils/borsh";

interface CreateVoteTopicInstruction {
  title: string;
  options: string[];
}

@injectable()
class VoteService {
  private connection: Connection;
  private programId: PublicKey;
  private signer: Signer;

  constructor(connectionUrl: string, programId: string) {
    this.connection = new Connection(connectionUrl, "confirmed");
    this.programId = new PublicKey(programId);
    this.signer = getSigner();
  }

  public async createVoteTopic(
    title: string,
    options: string[]
  ): Promise<{ signature: string; pubKey: string }> {
    try {
      if (!title) throw new Error("Voting topic is required");
      if (!Array.isArray(options)) throw new Error("Options must be an array");
      if (options.length > 10)
        throw new Error("Topic options should not exceed 10");
      if (title.length > 150)
        throw new Error("Voting topic is too long. Max of 150 characters.");

      for (const option of options) {
        if (option.length > 50)
          throw new Error(
            "Voting topic option is too long. Max 50 characters."
          );
      }

      const accountCreationData = await createVotingAccount(this.signer);
      const args = { CreateVoteTopicArgs: { title, options } };
      const instruction = serialize(args);
      const signature = await sendInstruction(
        instruction,
        accountCreationData?.accountPubKey!
      );
      return {
        signature,
        pubKey: accountCreationData?.accountPubKey?.toBase58()!,
      };
    } catch (error) {
      console.error("Error creating vote topic:", error);
      throw error;
    }
  }

  public async castVote(
    title: string,
    option: string,
    pubKey: string
  ): Promise<string> {
    try {
      if (!title && !option && !pubKey)
        throw new Error("Invalid arguments for casting votes");
      const args = {
        CastVoteArgs: { title, option },
      };
      const instruction = serialize(args);
      const signature = await sendInstruction(
        instruction,
        new PublicKey(pubKey)
      );
      return signature;
    } catch (error) {
      console.error("Error casting vote:", error);
      throw error;
    }
  }

  public async fetchVotesCount(topicPubKey: string): Promise<any> {
    try {
      if (!topicPubKey)
        throw new Error("Invalid arguments for fetching vote count");
      const accountData = (await getAccountStateData(
        new PublicKey(topicPubKey)
      )) as any;
      const totalVotes = accountData?.options.reduce(
        (acc: number, item: any) => acc + item.votes,
        0
      );
      return {
        totalVotes,
        options: accountData?.options,
      };
    } catch (error) {
      console.error("Error fetching vote count:", error);
      throw error;
    }
  }

  public async fetchAllTopics(): Promise<any> {
    try {
      const topics = (await getAllProgramAccounts()) as any;
      return {
        topics,
      };
    } catch (error) {
      console.error("Error fetching vote count:", error);
      throw error;
    }
  }
}

export default VoteService;
