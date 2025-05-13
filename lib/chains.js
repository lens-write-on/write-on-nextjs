// import { arbitrumSepolia } from "viem/chains";

const lens = {
    id: 37111,
    name: 'Lens Testnet',
    network: 'lens',
    // iconUrl: '/img/coffee-3.png',
    // iconBackground: '#fff',
    nativeCurrency: { name: 'GRASS', symbol: 'GRASS', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.testnet.lens.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Lens Explorer', url: 'https://explorer.testnet.lens.xyz' },
    },
    contracts: {
    },
}

const chainList = [
    // {...arb},
    // {...baseSepolia},
    { ...lens },
];
// console.log(arbitrumSepolia)

export const getChainById = (id) => {
    id = typeof id !== 'string' ? id?.toString() : id;
    return chainList.find((chain) => chain.id?.toString() === id);
};


// console.log(rollups);

export default chainList;