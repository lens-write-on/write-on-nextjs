'use client';
import Header from "@/components/Header";
import { CustomConnectButton } from "@/components/wallet/CustomConnectButton";
import MintBlog from "@/components/wallet/MintBlog";
import Logo from "@/components/Logo";

const AppsLayout = ({ children }) => {
    return (
            <main>
                <Header
                  LogoComponent={<Logo href="/apps" />}
                  menuItems={[

                  ]}
                  rightItems={[
                    <MintBlog key="mint-blog" />,
                    <CustomConnectButton key="connect" />,
                  ]}
                  glassMorphism={true}
                 />
                <div className="min-h-[100vh] bg-[#060606]">
                  <div className="py-8">
                    {children}
                  </div>
                </div>
            </main>
    )
};

export default AppsLayout;