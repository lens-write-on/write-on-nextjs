'use client';
import { createPublicClient, createWalletClient, http, custom } from "viem";
import chainList from "./chains";

export const connect = async ({
  chainId = 1,
  publicClient = false,
  account = null,
}) => {
  const chain = chainList.find((chain) => chain.id?.toString() === chainId?.toString());
  const rpc = getRpcFromId(chainId);

  if (publicClient) {
    return await createPublicClient({
      chain: chain,
      transport: http(rpc),
    });
  }

  console.log(`use wallet client, ${account}`)
  return await createWalletClient({
    chain: chain,
    transport: custom(window.ethereum),
  });
}

export const getRpcFromId = (id) => {
  id = typeof id !== 'string' ? id?.toString() : id;
  const chain = chainList.find((chain) => chain.id?.toString() === id);
  console.log(`chainsss >>>>`, chain);
  if (chain) {
    return chain?.rpcUrls?.default?.http[0];
  }
  return null; // or some default value
};

export async function fetchBalance(address, rpcId = '0', toEther = true) {
  const client = await connect({
    chainId: rpcId,
    publicClient: true,
  });
  const balance = await client.getBalance({ address })
  if (toEther) {
    // Convert Wei to Ether using BigInt arithmetic
    return Number(balance) / 1e18;
    // Alternative: For more precise values with large numbers
    // return (balance * 100n / 10n**18n) / 100; // 2 decimal points precision
  }
  return balance;
}
