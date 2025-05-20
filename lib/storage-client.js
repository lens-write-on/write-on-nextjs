import { StorageClient, mainnet } from "@lens-chain/storage-client";

export const storageClient = StorageClient.create(mainnet);

export default storageClient;