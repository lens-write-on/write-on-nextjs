'use client'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAccount } from "wagmi";
import { useUser } from "@/hooks/use-user"
import { CustomConnectButton } from "@/components/wallet/CustomConnectButton"
import { z } from "zod";
import FormFieldInput from "@/components/FormFieldInput";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { WordRotate } from '@/components/magicui/word-rotate';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast } from '@/hooks/use-toast';


const LoadingWord = () => {
  return (<>
  <div className='flex items-center justify-center'>
    <WordRotate
    className="text-sm font-bold text-muted-foreground"
    words={[`Connecting to sources...`, "Retrieving latest content...", "AI initiating analysis protocols...", "Analyzing text structure & sentiment...",
      "Scanning for AI generation markers...", 'Verifying content authenticity...', 'Matching content with campaign objectives...', 'Validating topic relevance...',
      'Calculating performance score...', 'Compiling insights & final score...'
    ]}
    duration={1250}
    motionProps={{
      initial: { opacity: 0, y: -50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
      transition: { duration: 0.25, ease: "easeOut" },
    }}
  />
</div>
  </>)
};

const submissionSchema = z.object({
  link: z
    .string()
    .url("Please enter a valid URL")
    .refine((url) => url.includes("x.com") || url.includes("medium.com"), {
      message: "Link must be from X or Medium",
    }),
});

const ConnectDialogContent = ({ isCheckingUser, isConnected, userExists }) => {
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-gray-400 mb-2">Please connect your wallet to create a campaign</p>
        <CustomConnectButton />
      </div>
    );
  }

  if (isCheckingUser) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-500 border-t-white"></div>
        <p className="text-gray-400">Checking your account status...</p>
      </div>
    );
  }

  if (userExists === false) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-gray-400 mb-2">You need to register before creating campaigns</p>
        <Button 
          onClick={() => router.push('/apps/account/register')}
          variant="outline" 
          className="rounded-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
        >
          Register Now
        </Button>
      </div>
    );
  }

  return null;
};

const fetchApi = async (submissionId, link, address) => {
  const response = await fetch("/api/campaigns/submission", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ submissionId, link, userWalletAddress: address }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit entry");
  }

  return response.json();
};

const submissionApi = async ({submissionId, link, address, totalScore, result}) => {
  const response = await fetch("/api/campaigns/submission/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ submissionId, link, userWalletAddress: address, totalScore, result }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit entry");
  }

  return response.json();
};


export default function SubmissionDialog({campaign, isCampaignActive}) {
  const { address, isConnected, chainId } = useAccount();
  const { userExists, isCheckingUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [isResultExpanded, setIsResultExpanded] = useState(false);
  const [isQualified, setIsQualified] = useState(false);
  const [qualifiedText, setQualifiedText] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const form = useForm({
    resolver: zodResolver(submissionSchema),
    defaultValues: { link: "" },
    mode: "onSubmit",
  });

  const handleCheck = async (values) => {
    setIsLoading(true);
    setResult(false);
    setIsResultExpanded(false);
    setIsQualified(false);
    setQualifiedText(false);
    setTotalScore(0);
    try{
      const res = await fetchApi(campaign.id, values.link, address);
      setResult(res);
      const AIScore = res?.result.AIContent.score < 70 ? false : true;
      const campaignFit = res?.result.score.campaign_fit_score < 60 ? false : true;

      const text = !AIScore || !campaignFit ? "Your entry does not meet the requirements for this campaign." : "Your entry meets the requirements for this campaign.";
      setIsQualified(AIScore && campaignFit);
      setQualifiedText(text);
      if(AIScore && campaignFit){
        const total = res?.result.score.campaign_fit_score * 0.6 + res?.result.score.virality_score * 0.2 + res?.result.score.quality_score * 0.2 ;
        console.log("Total Score:", total);
        setTotalScore(total);
      }

      console.log(res?.result);
    }catch (error) {
      console.error("Error submitting entry:", error);
      // Handle error (e.g., show a notification)
    }finally{
      setIsLoading(false);
    }
    // setIsOpen(false);
  };

  const handlePost = async () => {
    setIsLoading(true);
    try{
      await submissionApi({submissionId: campaign.id, link: form.getValues("link"), address, totalScore, result});
      toast({
        title: "Entry Submitted",
        description: "Your entry has been successfully submitted.",
        duration: 5000,
      });
      setIsOpen(false);
      // set form link to empty
      form.setValue("link", "");
      setResult(false);
      setIsResultExpanded(false);
      setIsQualified(false);
      setQualifiedText(false);
      setTotalScore(0);
    }catch (error) {
      console.error("Error submitting entry:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your entry.",
        duration: 5000,
        variant: "destructive",
      });
      // Handle error (e.g., show a notification)
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("isLoading:", isLoading);
    console.log("result:", result);
    console.log(`isCampaignActive: ${isCampaignActive}`);
  },[isLoading, result, qualifiedText, isCampaignActive]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        {isCampaignActive &&(<Button className="rounded-full transition-all duration-500" variant={"outline"}>
          Submit Entry
        </Button>)}
      </DialogTrigger>
      <DialogContent className="bg-[#060606]/95 border-gray-800/40">
        <DialogHeader>
          <DialogTitle>Submit Your Entry</DialogTitle>
        </DialogHeader>

        {(isCheckingUser || !userExists || !isConnected) ? (
          <ConnectDialogContent
            isCheckingUser={isCheckingUser}
            userExists={userExists}
            isConnected={isConnected}
          />
        ) : (
          <Form {...form} className="block w-full relative">
            <form onSubmit={form.handleSubmit(handleCheck)} className="py-4 space-y-4">
              <FormFieldInput
                formControl={form.control}
                fieldName="link"
                title="Link"
                placeholder="Enter a Twitter or Medium link"
                type="url"
                required
                validation={{
                  validate: (value) => {
                    if (!value.includes("twitter.com") && !value.includes("medium.com")) {
                      return "Link must be from Twitter or Medium";
                    }
                    return true;
                  },
                }}
              />
              {/* Display qualified status when result is available */}
              {qualifiedText && (
                <div className={`p-4 mb-4 rounded-xl border ${isQualified 
                  ? 'border-emerald-800/40 bg-emerald-950/20' 
                  : 'border-red-800/40 bg-red-950/20'}`}>
                  <p className={`text-sm font-medium ${isQualified 
                    ? 'text-emerald-400' 
                    : 'text-red-400'}`}>
                    {qualifiedText}
                  </p>
                </div>
              )}
              {/* Conditional rendering for result output */}
              {(result && (result !== false && result !== null && result !== undefined)) && (
              <Collapsible
                open={isResultExpanded}
                onOpenChange={setIsResultExpanded}
                className="w-full relative overflow-hidden border border-gray-800/20 rounded-md mb-4"
              >
                <div className="flex items-center justify-between p-2 bg-transparent">
                  <h4 className="text-sm font-bold text-muted-foreground">Result</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${isResultExpanded ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="border-t border-gray-800">
                    <div className="max-h-96 overflow-x-hidden max-w-[460px]">
                      <SyntaxHighlighter 
                        language="json" 
                        style={atomOneDark}
                        wrapLines={true}
                        customStyle={{ overflowWrap: 'break-word', fontSize: '12px', }}
                      >
                        {JSON.stringify(result?.result, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              )}
              {(isQualified && result) && (
                <Button variant="outline"
                  className="rounded-full w-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
                  disabled={isLoading || !form.formState.isValid}
                  onClick={handlePost}
                >
                  {isLoading
                  ? (<>
                    <span className="mr-2">Submiting...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white"></div>
                  </>)
                  : "Submit"}
                </Button>
              )}

              {(!isQualified && !result) && (
                <Button type="submit" variant="outline"
                  className="rounded-full w-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
                  disabled={isLoading || !form.formState.isValid}
                >
                {isLoading ? <LoadingWord /> : isQualified ? "Submit" : "Check Entry" }
              </Button>
              )}
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}