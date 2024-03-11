import {
  Cluster,
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { CLUSTER, PROGRAM_ID, WALLET_PRIVATE_KEY } from "../config/constants";
import { randomBytes } from "crypto";
import * as borsh from "borsh";
import bs58 from "bs58";
import { deserialize } from "./borsh";

const MAX_ACCOUNT_SPACE = 1024;
const programId = new PublicKey(PROGRAM_ID);

const connection = new Connection(
  clusterApiUrl(CLUSTER as Cluster),
  "confirmed"
);

export class InstructionData {
  data: { [x: string]: any };
  schema: any;
  constructor(data: { [x: string]: any }) {
    this.data = data;
    this.schema = generateSchema(data);
  }

  deserialize(data: any) {
    return borsh.deserialize(this.schema, "" as any, data);
  }
  serialize() {
    return borsh.serialize(this.schema, this.data);
  }

  toBuffer() {
    return Buffer.from(borsh.serialize(this.schema, this.data));
  }
  size() {
    const size = borsh.serialize(this.schema, this.data).length;
    return size;
  }
}

export function generateSchema(data: any) {
  const schemaFields: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(data)) {
    let borshType;

    // Determine Borsh type based on the field type
    switch (typeof value) {
      case "string":
        borshType = "string";
        break;
      case "number":
        borshType = "u8"; // Assuming 32-bit unsigned integer for simplicity
        break;
      case "object":
        if (Array.isArray(value)) {
          borshType = {
            array: { type: `${value.length > 0 ? typeof value[0] : "string"}` },
          };
        } else {
          throw new Error("Nested objects not supported");
        }
        break;
      default:
        throw new Error(`Unsupported field type: ${typeof value}`);
    }

    schemaFields[key] = borshType;
  }
  return { struct: schemaFields };
}

export function createRandomSeed() {
  const seed = randomBytes(8).toString("hex");
  return seed;
}

export function getSigner() {
  if (WALLET_PRIVATE_KEY) {
    const signer = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));
    return signer;
  } else {
    throw new Error("Missing private key");
  }
}

export async function createAccountFromSeed(
  seed: string,
  payer: Signer = getSigner()
) {
  const accountPubKey = await PublicKey.createWithSeed(
    payer.publicKey,
    seed,
    programId
  );
  return accountPubKey;
}

export async function getVotingAccountBySeed(seed: string) {
  const accountPubKey = await createAccountFromSeed(seed);
  return accountPubKey;
}

export async function createVotingAccount(payer: Signer = getSigner()) {
  const space = MAX_ACCOUNT_SPACE;
  const seed = createRandomSeed();
  const accountPubKey = await createAccountFromSeed(seed);

  const account = await connection.getAccountInfo(accountPubKey);

  if (account === null) {
    console.log("Creating voting account", accountPubKey.toBase58());
    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        newAccountPubkey: accountPubKey,
        seed,
        lamports,
        space,
        programId,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);

    return {
      signature,
      accountPubKey,
      seed,
    };
  } else {
    // Create a rety-with-different-seed logic instead of throwing an error
    // throw new Error("Account has already been generated with the seed")

    return undefined;
  }
}

export async function getAccountStateData(accountPubKey: PublicKey) {
  const accountInfo = await connection.getAccountInfo(accountPubKey);
  if (accountInfo?.data) {
    return deserialize(accountInfo.data);
  }
  return undefined;
}

export async function getAllProgramAccounts() {
  const accounts = await connection.getProgramAccounts(programId);
  const data = accounts
    .map((d) => {
      if (d.account?.data) {
        return {
          ...(deserialize(d.account.data) as any),
          pubKey: d.pubkey.toBase58()
        };
      }
      return undefined;
    })
    .filter((x) => (typeof x !== undefined && Boolean((x as any).title)));

    return data
}

export async function sendInstruction(
  instruction: Buffer,
  accountPubKey: PublicKey,
  payer: Signer = getSigner()
) {
  try {
    let transaction = new TransactionInstruction({
      programId,
      keys: [{ pubkey: accountPubKey, isSigner: false, isWritable: true }],
      data: instruction,
    });

    const signature = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(transaction),
      [payer]
    );

    return signature;
  } catch (error) {
    console.error("Error sending transaction", error);
    throw error;
  }
}
