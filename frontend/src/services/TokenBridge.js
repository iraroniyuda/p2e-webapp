import { getUserWalletAddress } from "@/services/apiClient";
import { ethers } from "ethers";
const contractAddress = ""; 
//Mainnet


//testnet

// ABI lengkap
const abi = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "RewardClaimed", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Staked", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Unstaked", "type": "event" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "accumulatedRewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "allowP2P", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "disableP2PTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "enableP2PTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getAllStakers", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getStakeInfo", "outputs": [{ "internalType": "uint256", "name": "stakeAmount", "type": "uint256" }, { "internalType": "uint256", "name": "lastStakeTime", "type": "uint256" }, { "internalType": "uint256", "name": "pendingReward", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isStaker", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "minimumStakeTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "rewardRatePerSecond", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "setMinimumStakeTime", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "rate", "type": "uint256" }], "name": "setRewardRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "cap", "type": "uint256" }], "name": "setStakingCap", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "stakeTimestamps", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "stakers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "stakingCap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalStaked", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userStakes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

export const getTokenBalance = async (address) => {
  try {
    if (!window.ethereum) throw new Error("Trust Wallet tidak ditemukan");
    if (!ethers.utils.isAddress(address)) throw new Error("Alamat wallet tidak valid");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== 137) {
      throw new Error("Jaringan bukan Polygon. Silakan ubah di Trust Wallet.");
    }

    //if (network.chainId !== 11155111) {
    //  throw new Error("Jaringan bukan Sepolia. Silakan ubah di Trust Wallet.");
    //}


    const contract = new ethers.Contract(contractAddress, abi, provider);
    const balance = await contract.balanceOf(address);

    return ethers.utils.formatUnits(balance, 18);
  } catch (e) {
    console.error("🔴 Error getTokenBalance:", e);
    throw e;
  }
};

export const transferTbp = async (recipient, amountTbp) => {
  if (!window.ethereum) throw new Error("Trust Wallet tidak tersedia");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, abi, signer);

  const decimals = 18;
  const amount = ethers.utils.parseUnits(amountTbp.toString(), decimals);

  const tx = await contract.transfer(recipient, amount);
  console.log("⏳ Mengirim...", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transfer berhasil:", receipt);
  return receipt;
};

// Mengecek apakah transfer P2P diizinkan
export const isP2PAllowed = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const result = await contract.allowP2P();
    return result;
  } catch (err) {
    console.error("❌ Gagal cek status P2P:", err);
    return false;
  }
};

// Mengunci transfer P2P (hanya owner bisa memanggil)
export const lockP2PTransfer = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.disableP2PTransfer();
    await tx.wait();
    console.log("✅ P2P transfer dikunci");
  } catch (err) {
    console.error("❌ Gagal mengunci P2P transfer:", err);
  }
};

// Membuka kembali transfer P2P (hanya owner bisa memanggil)
export const unlockP2PTransfer = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.enableP2PTransfer();
    await tx.wait();
    console.log("✅ P2P transfer diaktifkan kembali");
  } catch (err) {
    console.error("❌ Gagal membuka P2P transfer:", err);
  }
};

export const burnTbp = async (amountTbp) => {
  if (!window.ethereum) throw new Error("Trust Wallet tidak tersedia");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
  const tx = await contract.burn(amount);
  const receipt = await tx.wait();
  return receipt;
};

export const transferOwnership = async (newOwnerAddress) => {
  if (!window.ethereum) throw new Error("Trust Wallet tidak tersedia");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.transferOwnership(newOwnerAddress);
  const receipt = await tx.wait();
  return receipt;
};


export const stakeTbp = async (amountTbp) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
  const tx = await contract.stake(amount);
  return await tx.wait();
};

export const unstakeTbp = async (amountTbp) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
  const tx = await contract.unstake(amount);
  return await tx.wait();
};

export const claimStakingReward = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.claimReward();
  return await tx.wait();
};

export const getStakeInfo = async (userAddress) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, abi, provider);

  const [stakeAmount, lastStakeTime, pendingReward] = await contract.getStakeInfo(userAddress);
  return {
    stakeAmount: ethers.utils.formatUnits(stakeAmount, 18),
    lastStakeTime: Number(lastStakeTime),
    pendingReward: ethers.utils.formatUnits(pendingReward, 18),
  };
};

export const setRewardRate = async (rate) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.setRewardRate(rate);
  return await tx.wait();
};

export const setMinimumStakeTime = async (duration) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.setMinimumStakeTime(duration);
  return await tx.wait();
};

export const setStakingCap = async (cap) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.setStakingCap(cap);
  return await tx.wait();
};

export const sendTbpToOwner = async (amountTbp) => {
  if (!window.ethereum) throw new Error("Trust Wallet tidak tersedia");

  const polygonChainId = "0x89"; // 137 desimal
  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

  if (currentChainId !== polygonChainId) {
    // 🔄 Paksa user pindah ke Polygon
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: polygonChainId }],
    });
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const ownerAddress = "0xf84461C7F7073789e0DBeF7D29a0370d6a33b72e";
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
  const tx = await contract.transfer(ownerAddress, amount);
  console.log("⏳ Menunggu konfirmasi...");
  const receipt = await tx.wait(); // tunggu sampai mined
  console.log("✅ Konfirmasi berhasil:", receipt.transactionHash);
  return receipt.transactionHash;
};


export const sendTbpToExchanger = async (exchangerUserId, amountTbp) => {
  if (!window.ethereum) throw new Error("Trust Wallet tidak tersedia");

  // 🔄 Ambil wallet address dulu
  const exchangerWalletAddress = await getUserWalletAddress(exchangerUserId);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, abi, signer);
  const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);

  const tx = await contract.transfer(exchangerWalletAddress, amount);
  const receipt = await tx.wait();

  return receipt.transactionHash;
};



export const mintTbp = async (toAddress, amountTbp) => {
  if (!window.ethereum) throw new Error("Trust Wallet tidak tersedia");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
  const tx = await contract.mint(toAddress, amount);
  console.log("⏳ Minting...", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Mint berhasil:", receipt);
  return receipt;
};


