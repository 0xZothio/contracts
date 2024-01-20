import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ZothJson from "../artifacts/contracts/V2/ZothTestLPMultiFreq.sol/ZothTestLPMultiFreq.json";

export default function Home() {
  const zothContractAddress = "0x5B941de469E804d865870063dab267eb32D319F6";
  const zothContractABI = ZothJson.abi;
  const { address } = useAccount();
  const [contractDetail,setContractDetails] = useState({});

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
      setContractDetails({tenure1, tenure2, tenure3, freq, hotPeriod, poolId, reward, cooldownPeriod});

      console.log(contractDetail,"contractDetails")
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

        {address ? <div class="max-w-sm mx-auto mt-20">
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
        </div>: null}
      </div>
    </>
  );
}
