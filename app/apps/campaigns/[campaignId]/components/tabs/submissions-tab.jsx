"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Zap,
  ExternalLink,
  BarChart,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useSubmissions } from "../providers/submission-provider";
import SubmissionList from "../SubmissionList";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "@/hooks/use-toast";
import CampaignAbi from "@/lib/abi/Campaign.json";

// Parse JSON data from submission if needed
const parseSubmissionData = (submission) => {
  if (!submission?.data) return null;
  try {
    return typeof submission.data === "string"
      ? JSON.parse(submission.data)
      : submission.data;
  } catch (e) {
    console.error("Error parsing submission data:", e);
    return null;
  }
};

const approveSubmissionAPI = async (
  campaignId,
  submissionId,
  hash,
  walletSigner,
  callbackSuccess = () => {}
) => {
  try {
    const response = await fetch(`/api/campaigns/approve_submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaignId, submissionId, hash, walletSigner }),
    });
    if (!response.ok) {
      throw new Error("Failed to approve submission");
    }
    const data = await response.json();
    console.log("Submission approved successfully:", data);
    callbackSuccess();
    return data;
  } catch (error) {
    console.error("Error approving submission:", error);
    toast({
      title: "Error approving submission",
      description:
        "There was an error approving the submission. Please try again.",
      variant: "destructive",
    });
  }
};

export default function SubmissionsTab({ campaign }) {
  const { submissions, isLoading, error, refreshSubmissions } = useSubmissions(
    campaign?.id
  );
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const { address } = useAccount();
  const isOwner = campaign?.owner.walletAddress === address;

  const resWriteContract = useWriteContract();
  const {
    data: hash,
    isSuccess,
    error: writeError,
    writeContract,
  } = resWriteContract;
  const {
    data: txReceipt,
    isSuccess: receiptSuccess,
    isError: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    enabled: Boolean(hash),
  });

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
  };

  const approveSubmission = async ({ campaign, selectedSubmission }) => {
    if (!selectedSubmission || !campaign) return;
    const uwa = selectedSubmission.user.walletAddress;
    const total_score = selectedSubmission.total_score;
    const campaignAddress = campaign.campaignAddress;

    console.log(uwa, total_score, campaignAddress);
    await writeContract({
      address: campaignAddress,
      abi: CampaignAbi,
      functionName: "addContributor",
      args: [uwa, total_score],
    });
  };

  useEffect(() => {
    if (writeError) {
      toast({
        title: "Error approving submission",
        description: writeError.message,
        variant: "destructive",
      });
    }
    if (isSuccess) {
      toast({
        title: "Waiting for transaction",
        description: "Please wait while we process your transaction.",
        variant: "default",
      });
    }

    if (receiptSuccess) {
      toast({
        title: "Transaction Successful",
        description: "The submission has been approved successfully.",
        variant: "success",
      });
      approveSubmissionAPI(
        campaign.id,
        selectedSubmission.id,
        hash,
        address,
        refreshSubmissions
      );
    }

    if (receiptError) {
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your transaction.",
        variant: "destructive",
      });
    }
  }, [isSuccess, writeError, receiptSuccess, receiptError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" className="text-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 backdrop-blur-sm bg-black/30 rounded-xl border border-gray-800/20">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-400 mb-4 text-xl">Failed to load submissions</p>
        <Button
          onClick={refreshSubmissions}
          className="rounded-full"
          variant="secondary"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Prepare detailed view data if a submission is selected
  let detailedData = null;
  let scoreData = null;
  let aiContent = null;

  if (selectedSubmission) {
    detailedData = parseSubmissionData(selectedSubmission);
    scoreData = detailedData?.result?.score;
    aiContent = detailedData?.result?.AIContent;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Submissions</h2>
        {/* {!isOwner && (
          <Button variant="outline" size="sm" className="rounded-full">
            <Edit size={14} className="mr-1.5" />
            New Submission
          </Button>
        )} */}
      </div>
      <div className="grid grid-cols-12 gap-6 w-full">
        <div className="md:col-span-8">
          <SubmissionList
            submissions={submissions}
            onSubmissionSelect={handleSubmissionSelect}
            isOwner={isOwner}
            className="w-full"
          />
        </div>
        <div className="md:col-span-4 pt-4">
          {selectedSubmission ? (
            <div className="bg-[#060606] border border-gray-800/20 p-6 rounded-xl sticky top-6 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Submission Details
                </h3>
                {selectedSubmission.status && (
                  <Badge
                    className={`${getStatusColor(selectedSubmission.status)}`}
                  >
                    {formatStatus(selectedSubmission.status)}
                  </Badge>
                )}
              </div>

              {selectedSubmission.blog_url && (
                <div className="mb-6">
                  <a
                    href={selectedSubmission.blog_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center"
                  >
                    <ExternalLink size={14} className="mr-2" />
                    View Submission
                  </a>
                </div>
              )}

              {/* Score breakdown */}
              {scoreData && (
                <Card className="mb-4 bg-black/20 border-gray-800/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <BarChart size={16} className="mr-2 text-cyan-400" />
                      <CardTitle className="text-base">
                        Score Breakdown
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Quality</p>
                      <p className="font-medium text-white">
                        {scoreData.quality_score || 0}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Virality</p>
                      <p className="font-medium text-white">
                        {scoreData.virality_score || 0}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Campaign Fit</p>
                      <p className="font-medium text-white">
                        {scoreData.campaign_fit_score || 0}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Score</p>
                      <p className="font-medium text-emerald-400">
                        {selectedSubmission.total_score || 0}/100
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Content Analysis */}
              {aiContent && (
                <Card className="mb-4 bg-black/20 border-gray-800/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Zap size={16} className="mr-2 text-amber-400" />
                      <CardTitle className="text-base">
                        AI Content Analysis
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="mb-2">
                      <p className="text-gray-400">AI Score</p>
                      <p className="font-medium text-white">
                        {aiContent.score || 0}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Analysis</p>
                      <p className="text-gray-200">
                        {aiContent.explanation || "No explanation available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action buttons */}
              {isOwner && (
                <div className="space-y-3 mt-6">
                  {selectedSubmission.status == "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                      onClick={async () => {
                        await approveSubmission({
                          campaign,
                          selectedSubmission,
                        });
                      }}
                    >
                      Approve Submission
                    </Button>
                  )}
                  {/* <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-full border-red-500/20 text-red-500 hover:bg-red-500/10"
              >
                Reject Submission
              </Button> */}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#060606]/50 border border-gray-800/10 p-6 rounded-xl sticky top-6">
              <h3 className="text-xl font-semibold mb-4">Submission Details</h3>
              <p className="text-gray-500 mb-6">
                Select a submission from the list to view its details and take
                action
              </p>
              {/* {!isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Create New Submission
                </Button>
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to determine badge color based on status
function getStatusColor(status) {
  if (!status)
    return "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/20";

  switch (status.toLowerCase()) {
    case "accepted":
    case "approved":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
    case "pending":
    case "review":
      return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20";
    case "rejected":
    case "declined":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20";
    case "draft":
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/20";
  }
}

// Format status text for display
function formatStatus(status) {
  if (!status) return "Unknown";

  // Converting from database format (likely uppercase) to Title Case
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
