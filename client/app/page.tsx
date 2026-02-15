"use client"

import { useEffect, useRef, useState } from "react"
import { initWeb3, voteCandidate } from "@/src/utils/web3"

interface Candidate {
  id: number
  name: string
  voteCount: number
}

export default function Home() {
  const [account, setAccount] = useState<string>("")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [candidateId, setCandidateId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  // 🔒 Guard to prevent double execution (React Strict Mode)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const { contract, account } = await initWeb3()
      setAccount(account ?? "")

      const count = await contract.methods.candidateCount().call()

      const list: Candidate[] = []
      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.methods.candidates(i).call()
        list.push({
          id: Number(c.id),
          name: c.name,
          voteCount: Number(c.voteCount),
        })
      }

      setCandidates(list)
    } catch (error) {
      console.error("Error loading data:", error)
      alert("Failed to load contract data")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!candidateId) {
      alert("Enter candidate ID")
      return
    }

    try {
      setLoading(true)
      await voteCandidate(Number(candidateId))
      alert("Vote submitted successfully")
      await loadData()
    } catch (error) {
      console.error("Voting failed:", error)
      alert("Transaction failed or rejected")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Voting DApp
      </h1>

      {loading && (
        <p className="text-center text-blue-500 mb-4">
          Loading...
        </p>
      )}

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Candidate</th>
            <th className="border p-2 text-left">Votes</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2">{c.voteCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <input
        type="number"
        placeholder="Candidate ID (1, 2, 3...)"
        value={candidateId}
        onChange={(e) => setCandidateId(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={handleVote}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        Vote
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Connected account: {account}
      </p>
    </div>
  )
}
