import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount,
  useContractEvent, 
} from "wagmi";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ZothJson from "../artifacts/contracts/V2/ZothTestLPMultiFreq.sol/ZothTestLPMultiFreq.json";

export default function Home() {
  const [newEvent, setNewEvent] = useState();
  const [previousLogs, setPreviousLogs] = useState();
  const zothContractAddress = "0x5B941de469E804d865870063dab267eb32D319F6";
  const zothContractABI = ZothJson.abi;
  const { address } = useAccount();
  const [contractDetail, setContractDetails] = useState({});
  const usdc_Address = "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e";
  const usdc_Abi = [
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "symbol", type: "string" },
        { internalType: "uint8", name: "decimals", type: "uint8" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "subtractedValue", type: "uint256" },
      ],
      name: "decreaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "addedValue", type: "uint256" },
      ],
      name: "increaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
      name: "mint",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const contract = useContract({
    address: usdc_Address,
    abi: usdc_Abi,
  });

  useContractEvent({
    address: usdc_Address,
    abi: usdc_Abi,
    eventName: "Transfer",
    listener: (from, to, amount) => {
      setNewEvent({ from, to, amount });
    },
  });

  useEffect(() => {
    async function getPreviousLogs() {
      const myAddress = "0x5b8f1310A956ee1521A7bB56160451C786289aa9";
      const toAddress = "0x5F70Ddd9908B04f952b9cB2A6F8E4D451725ceDC";

      // Create a filter to get the logs
      const filter = contract.filters.Transfer(myAddress, toAddress);

      // Get the logs using the filter
      const logs = await contract.queryFilter(filter);
      setPreviousLogs(logs);
    }

    if (contract) getPreviousLogs();
  }, [contract]);
  const [variables, setVariables] = useState({
    tenure1: 0,
    tenure2: 0,
    tenure3: 0,
    reward: 0,
    freq: 0,
    poolid: 0,
    hotperiod: 0,
    coldperiod: 0,
  });
  const handleVariables = (e) => {
    setVariables({ ...variables, [e.target.name]: e.target.value });
  };

  const { write, data: writeData } = useContractWrite({
    address: zothContractAddress,
    abi: zothContractABI,
    functionName: "setContractVariables",
    
    onError: () => toast.error("An Error Occurred"),
  });
  const { isLoading } = useWaitForTransaction({
    hash: writeData?.hash,
    onSuccess: () => {
      toast.success("Contract Variables Set !!!");
    },
    onError: () => toast.error("An Error Occurred"),
  });

  function setContractVariables() {
    if (
      !variables.tenure1 ||
      !variables.tenure2 ||
      !variables.tenure3 ||
      !variables.reward ||
      !variables.freq ||
      !variables.poolid ||
      !variables.hotperiod ||
      !variables.coldperiod
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    if (address)
      write({
        args: [
          variables.tenure1,
          variables.tenure2,
          variables.tenure3,
          variables.reward,
          variables.freq,
          variables.poolid,
          variables.hotperiod,
          variables.coldperiod,
        ],
      });
  }

  const contractDetails = async () => {
    try {
      const tenure1 = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "tenure1",
        account: address,
      });
      const tenure2 = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "tenure2",
        account: address,
      });
      const tenure3 = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "tenure3",
        account: address,
      });
      const freq = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "freq",
        account: address,
      });
      const hotPeriod = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "hotPeriod",
        account: address,
      });
      const poolId = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "poolId",
        account: address,
      });
      const reward = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "reward",
        account: address,
      });
      const cooldownPeriod = await readContract({
        address: zothContractAddress,
        abi: zothContractABI,
        functionName: "cooldownPeriod",
        account: address,
      });
      setContractDetails({
        tenure1,
        tenure2,
        tenure3,
        freq,
        hotPeriod,
        poolId,
        reward,
        cooldownPeriod,
      });

      console.log(contractDetail, "contractDetails");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    contractDetails();
  }, [address]);
  return (
    <>
      <div className="container mx-auto p-10">
        <ToastContainer />
        <ConnectButton />

        {address ? (
          <div class="max-w-sm mx-auto mt-20">
            <div className="mt-2">
              <input
                type="number"
                name="tenure1"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Tenure 1"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>
            <div className="mt-2">
              <input
                type="number"
                name="tenure2"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Tenure 2"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>
            <div className="mt-2">
              <input
                type="number"
                name="tenure3"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Tenure 3"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>
            <div className="mt-2">
              <input
                type="number"
                name="reward"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Reward"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>
            <div className="mt-2">
              <input
                type="number"
                name="freq"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Freq"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>
            <div className="mt-2">
              <input
                type="number"
                name="poolid"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="PoolId"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>
            <div className="mt-2">
              <input
                type="number"
                name="hotperiod"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Hot Period"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>
            <div className="mt-2">
              <input
                type="number"
                name="coldperiod"
                aria-describedby="helper-text-explanation"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Cold Period"
                required
                onChange={(e) => handleVariables(e)}
              />
            </div>

            <button
              onClick={setContractVariables}
              className="px-3 py-1 border mt-3 rounded-md"
            >
              Set Contract Variables
            </button>
          </div>
        ) : null}

        <div>
          <p>New event: {JSON.stringigy(newEvent)}</p>
          <ul>
            {previousLogs.map((log, i) => (
              <li key={i}>{JSON.stringify(log)}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
