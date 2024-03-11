import { Keypair } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

export const PROGRAM_ID = process.env.PROGRAM_ID || 'Bxuyvf7opHksetkWvXkAchLJ7Mkr7jWpRkTQPZRhsLcx';
export const CLUSTER = process.env.CLUSTER || 'devnet'
export const WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY