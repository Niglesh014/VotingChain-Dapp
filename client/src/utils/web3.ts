import Web3 from "web3"
import VotingArtifact from "@/src/abi/Voting.json"

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

// change this if you use Ganache
const REQUIRED_CHAIN_ID = "0x7a69" // Hardhat = 31337

declare global {
  interface Window {
    ethereum?: any
  }
}

let web3: Web3 | null = null
let contract: any = null
let selectedAccount: string | null = null

export const initWeb3 = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found")
  }

  const chainId = await window.ethereum.request({
    method: "eth_chainId",
  })

 alert("MetaMask is connected to the Chian = " + chainId)
console.log("ACTUAL chainId from MetaMask =", chainId)

if (chainId !== REQUIRED_CHAIN_ID) {
  throw new Error("Wrong network")
}


  if (!web3) {
    web3 = new Web3(window.ethereum)

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    selectedAccount = accounts[0]

    contract = new web3.eth.Contract(
      VotingArtifact.abi,
      CONTRACT_ADDRESS
    )
  }

  return {
    web3,
    contract,
    account: selectedAccount,
  }
}

// ✅ THIS EXPORT WAS MISSING / NOT FOUND BEFORE
export const voteCandidate = async (id: number) => {
  const { contract, account } = await initWeb3()

  return contract.methods.vote(id).send({
    from: account,
  })
}
