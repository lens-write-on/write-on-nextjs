import { privateKeyToAccount } from "viem/accounts";

export const signer = privateKeyToAccount(process.env.NEXT_PUBLIC_APP_PRIVATE_KEY);
export default signer;