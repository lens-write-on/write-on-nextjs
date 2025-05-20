const lens = {
    id: 232,
    name: 'Lens',
    network: 'lens',
    nativeCurrency: { name: 'GHO', symbol: 'GHO', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.lens.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Lens Explorer', url: 'https://explorer.lens.xyz/' },
    },
    contracts: {
    },
}

const chainList = [
    { ...lens },
];

export const getChainById = (id) => {
    id = typeof id !== 'string' ? id?.toString() : id;
    return chainList.find((chain) => chain.id?.toString() === id);
};

export default chainList;