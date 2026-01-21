/**
 * Example deploy script for Stacks contracts using @stacks/transactions
 * Run with: `STACKS_NETWORK=testnet STACKS_API_URL=https://stacks-node-api.testnet.stacks.co \
 *            SENDER_ADDRESS=SP... SENDER_PRIVATE_KEY=your-hex-key CONTRACT_PATH=contracts/vault.clar CONTRACT_NAME=vault npx ts-node deploy_stacks.ts`
 *
 * Notes:
 * - This script fetches the account nonce from the Stacks API and then builds
 *   and broadcasts a contract-deploy transaction.
 * - Install dependencies: `npm install @stacks/transactions @stacks/network node-fetch` and `npm i -D ts-node typescript`
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';

async function main() {
  const networkType = process.env.STACKS_NETWORK || 'testnet';
  const apiUrl = process.env.STACKS_API_URL || (networkType === 'testnet'
    ? 'https://stacks-node-api.testnet.stacks.co'
    : 'https://stacks-node-api.mainnet.stacks.co');

  const senderAddress = process.env.SENDER_ADDRESS;
  const senderKey = process.env.SENDER_PRIVATE_KEY; // hex or micro-stacks key
  const contractPath = process.env.CONTRACT_PATH || 'contracts/vault.clar';
  const contractName = process.env.CONTRACT_NAME || path.basename(contractPath, '.clar');

  if (!senderAddress || !senderKey) {
    console.error('Set SENDER_ADDRESS and SENDER_PRIVATE_KEY in env');
    process.exit(1);
  }

  const codeBody = fs.readFileSync(contractPath, 'utf8');

  const apiBase = apiUrl.replace(/\/$/, '');
  const accountRes = await fetch(`${apiBase}/extended/v1/address/${senderAddress}`);
  if (!accountRes.ok) {
    console.error('Failed fetching account data:', await accountRes.text());
    process.exit(1);
  }
  const accountJson = await accountRes.json();
  const nonce = accountJson.nonce ?? 0;

  const network = networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

  console.log(`Deploying ${contractName} (nonce=${nonce}) to ${networkType} via ${apiBase}`);

  const tx = await makeContractDeploy({
    contractName,
    codeBody,
    senderKey,
    fee: 2500,
    nonce: Number(nonce),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  });

  const broadcastResult = await broadcastTransaction(tx, network);

  console.log('Broadcast result:', broadcastResult);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
