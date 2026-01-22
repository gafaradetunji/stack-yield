/**
 * Enhanced deploy script for Stacks contracts using @stacks/transactions
 * Supports deploying single or multiple contracts with proper nonce management
 * 
 * Single contract deployment:
 *   STACKS_NETWORK=testnet \
 *   SENDER_ADDRESS=ST... \
 *   SENDER_PRIVATE_KEY=your-hex-key \
 *   CONTRACT_PATH=contracts/vault.clar \
 *   CONTRACT_NAME=vault \
 *   npx ts-node deploy_stacks.ts
 * 
 * Multiple contracts deployment (comma-separated):
 *   STACKS_NETWORK=testnet \
 *   SENDER_ADDRESS=ST... \
 *   SENDER_PRIVATE_KEY=your-hex-key \
 *   CONTRACTS="vault,swap-manager,stacking-pool,rewards-ledger" \
 *   npx ts-node deploy_stacks.ts
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

interface DeploymentResult {
  contractName: string;
  txId: string;
  success: boolean;
  error?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAccountNonce(apiBase: string, address: string): Promise<number> {
  const accountRes = await fetch(`${apiBase}/extended/v1/address/${address}`);
  if (!accountRes.ok) {
    throw new Error(`Failed fetching account data: ${await accountRes.text()}`);
  }
  const accountJson = await accountRes.json();
  return accountJson.nonce ?? 0;
}

async function deployContract(
  contractName: string,
  contractPath: string,
  senderKey: string,
  nonce: number,
  network: StacksTestnet | StacksMainnet
): Promise<DeploymentResult> {
  try {
    console.log(`\n📄 Deploying ${contractName}...`);
    console.log(`   Path: ${contractPath}`);
    console.log(`   Nonce: ${nonce}`);

    const codeBody = fs.readFileSync(contractPath, 'utf8');

    const tx = await makeContractDeploy({
      contractName,
      codeBody,
      senderKey,
      fee: 5000, // Increased fee for reliability
      nonce: Number(nonce),
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });

    const broadcastResult = await broadcastTransaction(tx, network);

    if (typeof broadcastResult === 'object' && 'error' in broadcastResult) {
      return {
        contractName,
        txId: '',
        success: false,
        error: broadcastResult.error as string,
      };
    }

    const txId = typeof broadcastResult === 'string' ? broadcastResult : broadcastResult.txid;
    console.log(`   ✅ Success! TxID: ${txId}`);

    return {
      contractName,
      txId,
      success: true,
    };
  } catch (error) {
    console.error(`   ❌ Error deploying ${contractName}:`, error);
    return {
      contractName,
      txId: '',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const networkType = process.env.STACKS_NETWORK || 'testnet';
  const apiUrl = process.env.STACKS_API_URL || (networkType === 'testnet'
    ? 'https://stacks-node-api.testnet.stacks.co'
    : 'https://stacks-node-api.mainnet.stacks.co');

  const senderAddress = process.env.SENDER_ADDRESS;
  const senderKey = process.env.SENDER_PRIVATE_KEY;

  if (!senderAddress || !senderKey) {
    console.error('❌ ERROR: Set SENDER_ADDRESS and SENDER_PRIVATE_KEY in env');
    process.exit(1);
  }

  const apiBase = apiUrl.replace(/\/$/, '');
  const network = networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

  console.log('=== Stack Yield Contracts Deployment ===');
  console.log(`Network: ${networkType}`);
  console.log(`API: ${apiBase}`);
  console.log(`Deployer: ${senderAddress}`);

  // Determine which contracts to deploy
  let contractsToDeploy: Array<{ name: string; path: string }> = [];

  if (process.env.CONTRACTS) {
    // Multiple contracts mode
    const contractNames = process.env.CONTRACTS.split(',').map(s => s.trim());
    contractsToDeploy = contractNames.map(name => ({
      name,
      path: `contracts/${name}.clar`,
    }));
  } else if (process.env.CONTRACT_PATH && process.env.CONTRACT_NAME) {
    // Single contract mode
    contractsToDeploy = [{
      name: process.env.CONTRACT_NAME,
      path: process.env.CONTRACT_PATH,
    }];
  } else {
    console.error('❌ ERROR: Set either CONTRACTS (comma-separated) or CONTRACT_PATH + CONTRACT_NAME');
    process.exit(1);
  }

  console.log(`\nContracts to deploy: ${contractsToDeploy.map(c => c.name).join(', ')}`);

  // Fetch initial nonce
  let currentNonce = await fetchAccountNonce(apiBase, senderAddress);
  console.log(`Starting nonce: ${currentNonce}`);

  const results: DeploymentResult[] = [];

  // Deploy each contract sequentially
  for (const contract of contractsToDeploy) {
    const result = await deployContract(
      contract.name,
      contract.path,
      senderKey,
      currentNonce,
      network
    );

    results.push(result);

    if (result.success) {
      currentNonce++; // Increment nonce for next deployment

      // Wait between deployments to avoid rate limiting
      if (contractsToDeploy.indexOf(contract) < contractsToDeploy.length - 1) {
        console.log('   ⏳ Waiting 3 seconds before next deployment...');
        await sleep(3000);
      }
    } else {
      console.error(`\n⚠️  Deployment of ${contract.name} failed. Stopping batch deployment.`);
      break;
    }
  }

  // Print summary
  console.log('\n=== Deployment Summary ===');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.contractName}: ${result.txId}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result.txId}?chain=${networkType}`);
    } else {
      console.log(`❌ ${result.contractName}: ${result.error}`);
    }
  });

  // Save deployment info to file
  const deploymentInfo = {
    network: networkType,
    deployer: senderAddress,
    timestamp: new Date().toISOString(),
    results: results.map(r => ({
      contract: r.contractName,
      txId: r.txId,
      success: r.success,
      error: r.error,
      contractIdentifier: r.success ? `${senderAddress}.${r.contractName}` : null,
    })),
  };

  const outputFile = `deployment-${networkType}-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📝 Deployment info saved to: ${outputFile}`);

  // Exit with error if any deployment failed
  const hasFailures = results.some(r => !r.success);
  if (hasFailures) {
    console.error('\n❌ Some deployments failed. Check the summary above.');
    process.exit(1);
  }

  console.log('\n✅ All deployments successful!');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
