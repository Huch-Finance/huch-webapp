import { AnchorProvider, Program, Wallet, web3 } from "@coral-xyz/anchor";
import idl from "../target/vault.json";
import type { Vault } from "../types/vault";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const wallet = useAnchorWallet();
if (!wallet) {
  throw new Error("Wallet not connected");
}
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
const program = new Program(idl as Vault);

// Adresse à fill
const vaultPDA = new PublicKey("PDA"); 
const destinationTokenAccount = new PublicKey("DEST");
const vaultTokenAccount = new PublicKey("VAULT");
const authority = wallet.publicKey;
const user = wallet.publicKey;
const borrowStatePDA = new PublicKey("BORROWPDA");

async function initializeVault(name: string, tokenAddress: PublicKey, tokenDecimals: number) {
  try {
    const txSignature = await program.methods
      .initializeVault(name, tokenAddress, tokenDecimals)
      .accounts({
        vault: vaultPDA,
        admin: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Vault initialized. Transaction Signature:", txSignature);
  } catch (error) {
    console.error("Error initializing vault:", error);
  }
}

async function depositTokens(amount: number, sourceTokenAccount: PublicKey) {
  try {
    const txSignature = await program.methods
      .deposit(new web3.BN(amount))
      .accounts({
        vault: vaultPDA,
        admin: wallet.publicKey,
        sourceTokenAccount,
        vaultTokenAccount,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      })
      .rpc();

    console.log("Tokens deposited. Transaction Signature:", txSignature);
  } catch (error) {
    console.error("Error depositing tokens:", error);
  }
}

async function borrowTokens(amount: number, duration: number, id: number) {
  try {
    const txSignature = await program.methods
      .borrow(new web3.BN(amount), new web3.BN(duration), new web3.BN(id))
      .accounts({
        vault: vaultPDA,
        destinationTokenAccount,
        vaultTokenAccount,
        authority,
        user,
        borrowState: borrowStatePDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction Signature:", txSignature);
  } catch (error) {
    console.error("Error borrowing tokens:", error);
  }
}
