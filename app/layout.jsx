import { DM_Sans } from "next/font/google";
const dmSans = DM_Sans({ subsets: ["latin"] });

import "./globals.css";
import { Button } from "@/components/ui/button";
import Providers from "./providers";

import Link from "next/link";
import meta from "@/lib/meta";
import { cn } from "@/lib/utils";
import AccountModal from "@/components/wallet/AccountModal";

const TopLink = ({ href, text, target = "_self" }) => {
  return (
    <Link href={href} className="" target={target}>
      <Button
        variant="ghost"
        className="text-java-100 hover:text-java-50 hover:bg-java-800/60"
      >
        {text}
      </Button>
    </Link>
  );
};

export const metadata = {
  title: 'WriteOn - Earn by Writing',
  description: 'A platform to earn by writing',
};

/**
 * Root layout for the page
 *
 * @param {object} props - The props for the root layout
 * @param {React.ReactNode} props.children - The children for the root layout
 * @returns {React.ReactNode} The root layout
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn(dmSans.className, "dark")} suppressHydrationWarning>
      <body
        className="bg-background min-h-screen"
      >
        <Providers>
          <main>{children}</main>
          <AccountModal />
        </Providers>
      </body>
    </html>
  );
}
