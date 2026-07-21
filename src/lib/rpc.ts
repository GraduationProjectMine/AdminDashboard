import { ethers } from "ethers";
import { CERTIFICATE_REGISTRY_ABI } from "./contractAbi";

export const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
export const DEFAULT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export interface RpcNodeHealth {
  connected: boolean;
  rpcUrl: string;
  chainId?: number;
  networkName?: string;
  blockNumber?: number;
  gasPriceGwei?: string;
  error?: string;
}

export interface BlockItem {
  number: number;
  hash: string | null;
  parentHash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  miner: string;
}

export interface ContractState {
  address: string;
  owner: string;
  connected: boolean;
  codeLength: number;
  error?: string;
}

export interface ContractEventItem {
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  args: Record<string, any>;
  timestamp?: number;
}

export function getProvider(rpcUrl: string = DEFAULT_RPC_URL): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function checkRpcHealth(rpcUrl: string = DEFAULT_RPC_URL): Promise<RpcNodeHealth> {
  try {
    const provider = getProvider(rpcUrl);
    const [network, blockNumber, feeData] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getFeeData(),
    ]);

    const gasPriceGwei = feeData.gasPrice
      ? ethers.formatUnits(feeData.gasPrice, "gwei")
      : "0";

    return {
      connected: true,
      rpcUrl,
      chainId: Number(network.chainId),
      networkName: network.name === "unknown" ? `Chain ID ${network.chainId}` : network.name,
      blockNumber,
      gasPriceGwei: parseFloat(gasPriceGwei).toFixed(2),
    };
  } catch (err: any) {
    return {
      connected: false,
      rpcUrl,
      error: err?.message || "Failed to connect to RPC node",
    };
  }
}

export async function getRecentBlocks(
  limit: number = 10,
  rpcUrl: string = DEFAULT_RPC_URL
): Promise<BlockItem[]> {
  try {
    const provider = getProvider(rpcUrl);
    const latestBlockNum = await provider.getBlockNumber();
    const blocks: BlockItem[] = [];

    const start = Math.max(0, latestBlockNum - limit + 1);
    const promises = [];

    for (let i = latestBlockNum; i >= start; i--) {
      promises.push(provider.getBlock(i));
    }

    const blockResults = await Promise.all(promises);

    for (const b of blockResults) {
      if (!b) continue;
      blocks.push({
        number: b.number,
        hash: b.hash,
        parentHash: b.parentHash,
        timestamp: b.timestamp,
        transactionCount: b.transactions.length,
        gasUsed: b.gasUsed.toString(),
        gasLimit: b.gasLimit.toString(),
        miner: b.miner,
      });
    }

    return blocks;
  } catch (err) {
    console.error("Error fetching recent blocks:", err);
    return [];
  }
}

export async function getContractState(
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  rpcUrl: string = DEFAULT_RPC_URL
): Promise<ContractState> {
  try {
    const provider = getProvider(rpcUrl);
    const code = await provider.getCode(contractAddress);

    if (!code || code === "0x") {
      return {
        address: contractAddress,
        owner: "N/A",
        connected: false,
        codeLength: 0,
        error: "No bytecode found at specified contract address.",
      };
    }

    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);
    let ownerAddress = "Unknown";
    try {
      ownerAddress = await contract.owner();
    } catch {
      ownerAddress = "Unable to read owner()";
    }

    return {
      address: contractAddress,
      owner: ownerAddress,
      connected: true,
      codeLength: code.length,
    };
  } catch (err: any) {
    return {
      address: contractAddress,
      owner: "N/A",
      connected: false,
      codeLength: 0,
      error: err?.message || "Failed to inspect contract",
    };
  }
}

export async function checkIssuerAuthStatus(
  issuerAddress: string,
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  rpcUrl: string = DEFAULT_RPC_URL
): Promise<boolean> {
  try {
    if (!ethers.isAddress(issuerAddress)) return false;
    const provider = getProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);
    return await contract.authorizedIssuers(issuerAddress);
  } catch (err) {
    console.error("Error checking issuer status:", err);
    return false;
  }
}

export async function getContractEvents(
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  rpcUrl: string = DEFAULT_RPC_URL
): Promise<ContractEventItem[]> {
  try {
    const provider = getProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);
    
    // Fetch logs from block 0
    const filter = {
      address: contractAddress,
      fromBlock: 0,
      toBlock: "latest",
    };

    const logs = await provider.getLogs(filter);
    const parsedEvents: ContractEventItem[] = [];

    for (const log of logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed) {
          const argsObj: Record<string, any> = {};
          parsed.fragment.inputs.forEach((input, index) => {
            let val = parsed.args[index];
            if (typeof val === "bigint") val = val.toString();
            argsObj[input.name] = val;
          });

          parsedEvents.push({
            eventName: parsed.name,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            args: argsObj,
          });
        }
      } catch {
        // Skip unparseable log
      }
    }

    return parsedEvents.reverse();
  } catch (err) {
    console.error("Error fetching contract events:", err);
    return [];
  }
}
