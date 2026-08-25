import { ethers } from "ethers";
import { CERTIFICATE_REGISTRY_ABI } from "./contractAbi";

export const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
export const DEFAULT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export interface IssuingSchool {
  organization_id: string;
  organization_name: string;
  contact_email: string;
  wallet_address: string | null;
  is_verified: boolean;
  isActive?: boolean;
  is_onchain_authorized?: boolean;
  logo_url?: string | null;
  created_at: string;
}

export interface MonitorOverview {
  blockchain: {
    connected: boolean;
    network: string | null;
    chainId: number | null;
    blockNumber: number | null;
    contractAddress: string | null;
    walletAddress: string | null;
    walletBalance: string | null;
  };
  ipfs: { connected: boolean; gateway: string; error: string | null };
  totals: { transactions: number; cids: number; failedTransactions: number };
  transactions: Array<{
    timestamp: string | null;
    certificateId: string;
    certificateCode: string | null;
    certificateTitle?: string | null;
    studentName?: string | null;
    organizationName?: string | null;
    creatorAddress?: string | null;
    action: "ISSUE" | "REVOKE";
    transactionHash: string | null;
    blockNumber: number | null;
    gasUsed: string | null;
    status: "SUCCESS" | "FAILED";
  }>;
  cids: Array<{
    certificateId: string;
    certificateCode: string | null;
    cid: string;
    createdAt: string;
  }>;
}

export interface ContractActivityItem {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  creator: string;
  creatorName?: string;
  actionType: "REGISTER_CERT" | "REVOKE_CERT" | "AUTHORIZE_ISSUER" | "DEAUTHORIZE_ISSUER" | "QUERY_CERT" | "UNKNOWN";
  actionLabel: string;
  gasUsed?: string;
  args: Record<string, any>;
  status: "SUCCESS" | "FAILED";
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/api$/, "");
}

function checkResponseAuth(res: Response) {
  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin_token_expired"));
  }
}

// ----------------------------------------------------
// Real Backend API: Issuers & Schools
// ----------------------------------------------------
export async function fetchIssuers(): Promise<IssuingSchool[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/system/issuers`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    checkResponseAuth(res);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch issuers from API:", err);
    return [];
  }
}

export async function createIssuerApi(dto: {
  organization_name: string;
  contact_email: string;
  wallet_address?: string;
  is_verified?: boolean;
}): Promise<IssuingSchool | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/system/issuers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    checkResponseAuth(res);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("Failed to create issuer:", err);
    throw err;
  }
}

export async function updateIssuerVerificationApi(
  organizationId: string,
  isVerified: boolean
): Promise<{ success: boolean; data?: IssuingSchool }> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/system/issuers/${organizationId}/verify`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_verified: isVerified }),
    });
    checkResponseAuth(res);
    if (!res.ok) return { success: false };
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("Failed to update issuer verification:", err);
    return { success: false };
  }
}

export async function updateIssuerStatusApi(
  organizationId: string,
  isActive: boolean
): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/system/issuers/${organizationId}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });
    checkResponseAuth(res);
    return res.ok;
  } catch (err) {
    console.error("Failed to update issuer status:", err);
    return false;
  }
}

export async function deleteIssuerApi(organizationId: string): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/system/issuers/${organizationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    checkResponseAuth(res);
    return res.ok;
  } catch (err) {
    console.error("Failed to delete issuer:", err);
    return false;
  }
}

// ----------------------------------------------------
// Real Backend API: System Monitor & Transactions
// ----------------------------------------------------
export async function fetchSystemMonitor(): Promise<MonitorOverview | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/system/monitor`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    checkResponseAuth(res);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch system monitor data:", err);
    return null;
  }
}

export async function retryRevocation(certificateId: string): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/certificates/${certificateId}/retry-revoke`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    checkResponseAuth(res);
    return res.ok;
  } catch (err) {
    console.error("Failed to retry revocation:", err);
    return false;
  }
}

// ----------------------------------------------------
// EVM Node & JSON-RPC Calls
// ----------------------------------------------------
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

// ----------------------------------------------------
// Real On-Chain Contract Activity & Transactions
// ----------------------------------------------------
export async function getContractActivities(
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  rpcUrl: string = DEFAULT_RPC_URL
): Promise<ContractActivityItem[]> {
  try {
    const provider = getProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, CERTIFICATE_REGISTRY_ABI, provider);

    const filter = {
      address: contractAddress,
      fromBlock: 0,
      toBlock: "latest",
    };

    const logs = await provider.getLogs(filter);
    const activities: ContractActivityItem[] = [];

    for (const log of logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (!parsed) continue;

        const argsObj: Record<string, any> = {};
        parsed.fragment.inputs.forEach((input, index) => {
          let val = parsed.args[index];
          if (typeof val === "bigint") val = val.toString();
          argsObj[input.name] = val;
        });

        // Determine action type and creator
        let actionType: ContractActivityItem["actionType"] = "UNKNOWN";
        let actionLabel = parsed.name;
        let creator = log.address;

        if (parsed.name === "CertificateRegistered") {
          actionType = "REGISTER_CERT";
          actionLabel = "Issue Certificate (registerCertificate)";
          creator = argsObj.issuer || log.address;
        } else if (parsed.name === "CertificateRevoked") {
          actionType = "REVOKE_CERT";
          actionLabel = "Revoke Certificate (revokeCertificate)";
          creator = argsObj.revoker || log.address;
        } else if (parsed.name === "IssuerAuthorized") {
          actionType = "AUTHORIZE_ISSUER";
          actionLabel = "Authorize Issuer (authorizeIssuer)";
          creator = argsObj.issuer || log.address;
        } else if (parsed.name === "IssuerDeauthorized") {
          actionType = "DEAUTHORIZE_ISSUER";
          actionLabel = "Deauthorize Issuer (deauthorizeIssuer)";
          creator = argsObj.issuer || log.address;
        }

        const block = await provider.getBlock(log.blockNumber).catch(() => null);

        activities.push({
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: block ? block.timestamp : Math.floor(Date.now() / 1000),
          creator,
          actionType,
          actionLabel,
          args: argsObj,
          status: "SUCCESS",
        });
      } catch {
        // Skip unparseable log
      }
    }

    return activities.reverse();
  } catch (err) {
    console.error("Error fetching contract activities:", err);
    return [];
  }
}

export const getContractEvents = getContractActivities;
export type ContractEventItem = ContractActivityItem;
