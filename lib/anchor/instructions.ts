import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import type { Vault } from "./types/vault";
import idl from "./idl.json";
import {
    PROGRAM_ID,
    VAULT_SEED,
    VAULT_PDA,
    VAULT_TOKEN_ACCOUNT,
    CLUSTER_URL
} from "./constants"
 
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
 
export const program = new Program(idl as Vault, {
  connection,
});

async function init() {
    const [ vaultPdaResult ] = await PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      PROGRAM_ID
    );

    const vaultPda = vaultPdaResult;
}