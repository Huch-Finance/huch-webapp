/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vault.json`.
 */
export type Vault = {
  "address": "Fj1Yp4m5mAePSAT9auPsJ3sEmASHG3isy1fVvJ3CQvCj",
  "metadata": {
    "name": "vault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "borrow",
      "docs": [
        "Borrows tokens from the vault.",
        "",
        "Accounts:",
        "0. `[writable, signer]` fee_payer: [AccountInfo]",
        "1. `[writable]` vault: [Vault] The Vault PDA.",
        "2. `[writable]` destination_token_account: [AccountInfo] The token account to borrow to.",
        "3. `[writable]` vault_token_account: [AccountInfo] The vault's token account.",
        "4. `[writable]` source: [AccountInfo] The source account.",
        "5. `[writable]` destination: [AccountInfo] The destination account.",
        "6. `[signer]` authority: [AccountInfo] The source account's owner/delegate.",
        "7. `[]` csl_spl_token_v0_0_0: [AccountInfo] Auto-generated, CslSplTokenProgram v0.0.0",
        "",
        "Data:",
        "- amount: [u64] The amount to borrow."
      ],
      "discriminator": [
        228,
        253,
        131,
        202,
        207,
        116,
        89,
        18
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "destinationTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "authority"
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "borrowState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  114,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "duration",
          "type": "i64"
        },
        {
          "name": "id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "docs": [
        "Deposits tokens into the vault.",
        "",
        "Accounts:",
        "0. `[writable, signer]` fee_payer: [AccountInfo]",
        "1. `[writable]` vault: [Vault] The Vault PDA.",
        "2. `[writable, signer]` admin: [AccountInfo] The admin of the vault.",
        "3. `[writable]` source_token_account: [AccountInfo] The token account to deposit from.",
        "4. `[writable]` vault_token_account: [AccountInfo] The vault's token account.",
        "5. `[writable]` source: [AccountInfo] The source account.",
        "6. `[writable]` destination: [AccountInfo] The destination account.",
        "7. `[signer]` authority: [AccountInfo] The source account's owner/delegate.",
        "8. `[]` csl_spl_token_v0_0_0: [AccountInfo] Auto-generated, CslSplTokenProgram v0.0.0",
        "",
        "Data:",
        "- amount: [u64] The amount to deposit."
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "sourceTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeVault",
      "docs": [
        "Initializes the Vault PDA with the provided data.",
        "",
        "Accounts:",
        "0. `[writable, signer]` fee_payer: [AccountInfo]",
        "1. `[writable]` vault: [Vault] The Vault PDA.",
        "2. `[writable, signer]` admin: [AccountInfo] The admin of the vault.",
        "3. `[]` system_program: [AccountInfo] Auto-generated, for account initialization",
        "",
        "Data:",
        "- name: [String] The name of the vault.",
        "- token_address: [Pubkey] The address of the token.",
        "- token_decimals: [u8] The decimals of the token."
      ],
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "tokenAddress",
          "type": "pubkey"
        },
        {
          "name": "tokenDecimals",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "borrowState",
      "discriminator": [
        20,
        249,
        107,
        83,
        142,
        255,
        174,
        131
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidTokenAccount",
      "msg": "The token account is invalid."
    },
    {
      "code": 6001,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6002,
      "name": "insufficientFunds",
      "msg": "Insufficient Funds"
    },
    {
      "code": 6003,
      "name": "invalidDuration",
      "msg": "Invalid duration. Duration must be between 7 and 30 days."
    }
  ],
  "types": [
    {
      "name": "borrowState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "userAddress",
            "type": "pubkey"
          },
          {
            "name": "duration",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "tokenAddress",
            "type": "pubkey"
          },
          {
            "name": "tokenDecimals",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
