import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import {
  makeContractDeploy,
  broadcastTransaction,
} from '@stacks/transactions';

async function main() {
  const networkType = process.env.STACKS_NETWORK || 'testnet';
  const apiUrl = process.env.STACKS_API_URL || (networkType === 'testnet'
    ? 'https://api.testnet.hiro.so'
    : 'https://api.mainnet.hiro.so');

  const network = networkType === 'mainnet' ? { ...STACKS_MAINNET } : { ...STACKS_TESTNET };
  network.coreApiUrl = apiUrl.replace(/\/$/, '');

  const senderAddress = process.env.SENDER_ADDRESS;
  const senderKey = process.env.SENDER_PRIVATE_KEY;

  // SUPPORT BATCH DEPLOYMENT
  const contractsStr = process.env.CONTRACTS || '';
  const singleContractPath = process.env.CONTRACT_PATH;

  const contractsToDeploy = contractsStr
    ? contractsStr.split(',').map(name => ({ name: name.trim(), path: `contracts/${name.trim()}.clar` }))
    : singleContractPath
      ? [{ name: process.env.CONTRACT_NAME || path.basename(singleContractPath, '.clar'), path: singleContractPath }]
      : [];

  if (contractsToDeploy.length === 0) {
    console.error('No contracts specified for deployment. Set CONTRACTS or CONTRACT_PATH.');
    process.exit(1);
  }

  if (!senderAddress || !senderKey) {
    console.error('Set SENDER_ADDRESS and SENDER_PRIVATE_KEY in env');
    process.exit(1);
  }

  const accountRes = await fetch(
    `${network.coreApiUrl}/v2/accounts/${senderAddress}`,
    {}
  );

  if (!accountRes.ok) {
    console.error('Failed fetching account data:', await accountRes.text());
    process.exit(1);
  }

  const accountJson = await accountRes.json() as any;
  let currentNonce = accountJson.nonce ?? 0;

  console.log(`Starting deployment of ${contractsToDeploy.length} contracts to ${networkType} using ${network.coreApiUrl}`);
  console.log(`Deployer: ${senderAddress}, Starting Nonce: ${currentNonce}`);
  console.log('--------------------------------------------------');

  for (const contract of contractsToDeploy) {
    const { name, path: contractFilePath } = contract;

    const fullPath = path.isAbsolute(contractFilePath) ? contractFilePath : path.join(process.cwd(), contractFilePath);

    if (!fs.existsSync(fullPath)) {
      console.error(`Contract file not found: ${fullPath}`);
      continue;
    }

    const codeBody = fs.readFileSync(fullPath, 'utf8');

    console.log(`Deploying ${name} (nonce=${currentNonce})...`);

    try {
      const tx = await makeContractDeploy({
        contractName: name,
        codeBody,
        senderKey,
        fee: 100000, // Increased fee for testnet congestion
        nonce: Number(currentNonce),
        network,
      });

      const broadcastResult = await broadcastTransaction({
        transaction: tx,
        network,
      });

      if ('error' in broadcastResult && broadcastResult.error) {
        console.error(`Error broadcasting ${name}:`, broadcastResult.error);
        if ('reason' in broadcastResult) console.error(`Reason: ${broadcastResult.reason}`);
        // Increment nonce anyway to avoid collision in next loop iteration if we want to force next
        currentNonce++;
      } else {
        console.log(`Broadcast successful for ${name}. TXID: ${broadcastResult.txid}`);
        currentNonce++;
      }
    } catch (err) {
      console.error(`Failed to deploy ${name}:`, err);
    }
    console.log('--------------------------------------------------');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
