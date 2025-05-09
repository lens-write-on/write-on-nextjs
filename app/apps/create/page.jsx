"use client";
import { useState, useEffect, useReducer } from "react";
import { Calendar, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import FormFieldInput from "@/components/FormFieldInput";
import FormImageUpload from "@/components/FormImageUpload";
import {
  useAccount,
  useSignMessage,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { CustomConnectButton } from "@/components/wallet/CustomConnectButton";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import contracts from "@/lib/contracts";
import TransactionErrorDisplay from "@/app/components/TransactionErrorDisplay";
import { changeDateTimeZoneToUTC } from "@/lib/utils";

// Define transaction state reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case "TRANSACTION_START":
      return { ...state, isProcessing: true, error: null };
    case "TRANSACTION_SUCCESS":
      return {
        ...state,
        isProcessing: false,
        isSuccess: true,
        hash: action.payload,
      };
    case "CONTRACT_ADDRESS_RECEIVED":
      return { ...state, contractAddress: action.payload };
    case "SET_CONTRACT_ADDRESS": // Add matching case for SET_CONTRACT_ADDRESS
      return { ...state, contractAddress: action.payload };
    case "TRANSACTION_ERROR":
      return {
        ...state,
        isProcessing: false,
        error: action.payload,
        isError: true,
      };
    case "RESET":
      return {
        isProcessing: false,
        isSuccess: false,
        isError: false,
        hash: null,
        error: null,
        contractAddress: null,
      };
    default:
      return state;
  }
};

const ButtonCreateCampaign = ({ state, setState, isSubmitting, form }) => {
  // Handles validation before moving to next tab
  const handleNextTab = async () => {
    let fieldsToValidate = [];

    // Determine which fields to validate based on current tab
    if (state === "details") {
      fieldsToValidate = ["title", "description", "keywords", "rewardPool"];
    } else if (state === "requirements") {
      fieldsToValidate = ["startDate", "endDate", "targetAudience"];
    }
    console.log(form);
    console.log(form.getValues());

    // Trigger validation for the specific fields
    const result = await form.trigger(fieldsToValidate);

    if (result) {
      // If validation passes, move to next tab
      const nextTab =
        state === "details"
          ? "requirements"
          : state === "requirements"
          ? "media"
          : "media";
      setState(nextTab);
    }
  };

  if (state === "media") {
    return (
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="outline"
        className="rounded-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
      >
        {isSubmitting ? (
          <>
            <span className="mr-2">Creating...</span>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white"></div>
          </>
        ) : (
          "Create Campaign"
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleNextTab}
      disabled={isSubmitting}
      variant="outline"
      className="rounded-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
    >
      Next
    </Button>
  );
};

const formSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    startDate: z
      .string()
      .refine(
        (value) => {
          // Validate date format from datetime-local input (YYYY-MM-DDThh:mm)
          const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
          return regex.test(value);
        },
        {
          message: "Invalid date format",
        }
      )
      .transform((value) => new Date(value)),
    endDate: z
      .string()
      .refine(
        (value) => {
          // Validate date format from datetime-local input (YYYY-MM-DDThh:mm)
          const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
          return regex.test(value);
        },
        {
          message: "Invalid date format",
        }
      )
      .transform((value) => new Date(value)),
    campaignAddress: z.string().optional(),
    aiDescription: z.string().optional(),
    keywords: z.string().min(3, "Keywords are required"),
    targetAudience: z.string().optional(),
    ctaGoal: z.string().optional(),
    coverImage: z.any().optional(),
    rewardPool: z.number().min(0, "Reward pool must be a positive number"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be later than start date",
    path: ["endDate"],
  })
  // .refine(
  //   (data) => {
  //     const today = new Date();
  //     today.setHours(23, 59, 59, 999);
  //     return data.endDate > today;
  //   },
  //   {
  //     message: "End date must be after today",
  //     path: ["endDate"],
  //   }
  // )
  .refine(
    (data) => {
      const minDate = new Date(2025, 0, 1); // January 1, 2025
      return data.startDate >= minDate;
    },
    {
      message: "Start date cannot be before 2025",
      path: ["startDate"],
    }
  );

export default function CreateCampaignPage() {
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address, isConnected, chainId } = useAccount();
  const { userExists, isCheckingUser } = useUser();
  const router = useRouter();
  const {
    data: signatureData,
    error: signError,
    isLoading: isSignLoading,
    signMessage,
  } = useSignMessage();
  const resWriteContract = useWriteContract();
  const {
    data: hash,
    isPending,
    isError,
    error: writeError,
    writeContract,
  } = resWriteContract;

  // Add public client to get transaction receipt
  const publicClient = usePublicClient();
  // Add hook to wait for transaction receipt
  const { data: txReceipt, isLoading: isWaitingForReceipt } =
    useWaitForTransactionReceipt({
      hash,
      enabled: Boolean(hash),
    });

  // Initialize transaction state with useReducer
  const initialTransactionState = {
    isProcessing: false,
    isSuccess: false,
    isError: false,
    hash: null,
    error: null,
    contractAddress: null,
  };

  const [txState, dispatchTx] = useReducer(
    transactionReducer,
    initialTransactionState
  );

  // Redirect unregistered users to the registration page
  useEffect(() => {
    if (isConnected && !isCheckingUser && userExists === false) {
      toast({
        title: "Registration Required",
        description: "You need to register before creating campaigns.",
        duration: 5000,
      });
      router.push("/apps/account/register");
    }
  }, [isConnected, isCheckingUser, userExists, router]);

  // Monitor contract interaction states
  useEffect(() => {
    if (isPending) {
      dispatchTx({ type: "TRANSACTION_START" });
      toast({
        title: "Processing Transaction",
        description: "Your transaction is being processed on the blockchain.",
        duration: 5000,
      });
    } else if (hash) {
      dispatchTx({ type: "TRANSACTION_SUCCESS", payload: hash });
      toast({
        title: "Transaction Submitted",
        description: "Your transaction has been submitted to the blockchain.",
        duration: 5000,
      });
      console.log("Transaction hash:", hash);
    } else if (isError) {
      dispatchTx({ type: "TRANSACTION_ERROR", payload: writeError });

      // Extract meaningful error message
      let errorMessage = "Unknown error occurred";
      if (writeError) {
        if (typeof writeError === "object" && writeError.shortMessage) {
          errorMessage = writeError.shortMessage;
        } else if (typeof writeError === "object" && writeError.message) {
          errorMessage = writeError.message;
        } else if (typeof writeError === "string") {
          errorMessage = writeError;
        }
      }

      // Show error toast with detailed message and retry option
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: `${errorMessage}. Please try again.`,
        duration: 10000,
      });

      console.error("Transaction error:", writeError);
      setIsSubmitting(false);
    }
  }, [isPending, hash, isError, writeError, toast]);

  // Effect to extract contract address from transaction receipt
  useEffect(() => {
    if (txReceipt) {
      console.log("Transaction receipt:", txReceipt);
      const contractAddress = txReceipt.logs[0].address; // new contaract address

      console.log("Contract address:", contractAddress);
      dispatchTx({ type: "SET_CONTRACT_ADDRESS", payload: contractAddress });
    }
  }, [txReceipt, chainId]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      aiDescription: "",
      keywords: "",
      targetAudience: "",
      ctaGoal: "",
      coverImage: undefined,
      rewardPool: 0,
    },
    mode: "onSubmit",
  });

  async function onSubmit(values) {
    if (!isConnected || !address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign.",
      });
      return;
    }

    try {
      // Reset any previous transaction state
      dispatchTx({ type: "RESET" });
      setIsSubmitting(true);

      const contractAddress = contracts[chainId].campaignManager.address;
      const contractABI = contracts[chainId].campaignManager.abi;

      // Convert dates to UTC timestamps (in seconds)
      const startTimestamp = Math.floor(values.startDate.getTime() / 1000);
      const endTimestamp = Math.floor(values.endDate.getTime() / 1000);
      
      // Execute contract transaction
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "createCampaign",
        args: [
          values.title || "Campaign",
          startTimestamp,
          endTimestamp,
          parseInt(values.rewardPool) * 10 ** 18,
        ],
      });

      // The transaction state and receipt handling is now done in the useEffect hooks
      // We'll wait for the transaction to be confirmed before proceeding
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        variant: "destructive",
        title: "Error creating campaign",
        description: error.message || "Something went wrong. Please try again.",
      });
      setIsSubmitting(false);
    }
  }

  // Effect to handle API submission after transaction confirmation and contract address is available
  useEffect(() => {
    const submitToAPI = async () => {
      console.log(`submitting to API...`);
      console.log(`txState:`, txState);
      if (txState.isSuccess && txState.hash && txState.contractAddress) {
        try {
          const values = form.getValues();
          console.log("Form values:", values);

          // Prepare form data for API submission
          const formData = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (key === "coverImage") {
              if (value) {
                formData.append("coverImage", value);
              }
            } else if (key === "startDate" || key === "endDate") {
              // Parse the date values and create new Date objects
              if (value) {
                const dateValue = (new Date(value)).toISOString();
                console.log(`Parsed ${key}:`, dateValue);
                formData.append(key, dateValue);
              }
            } else if (value !== undefined && value !== null) {
              formData.append(
                key,
                typeof value === "object" ? JSON.stringify(value) : value
              );
            }
          });

          // Add wallet address, transaction hash and contract address to form data
          formData.append("walletAddress", address);
          formData.append("txHash", txState.hash);
          formData.append("campaignAddress", txState.contractAddress);
          
          // Log the final form data before submission
          console.log("Final form data prepared for API:");
          for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value instanceof File ? value.name : value}`);
          }
          
          const response = await fetch("/api/campaigns/create", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (data.success) {
            toast({
              title: "Campaign created!",
              description: "Your campaign has been created successfully.",
            });
            // Navigate to the campaigns list after successful creation
            router.push("/apps");
          } else {
            throw new Error(data.message || "Failed to create campaign");
          }
        } catch (apiError) {
          console.error("Error submitting campaign to API:", apiError);
          toast({
            variant: "destructive",
            title: "Error saving campaign details",
            description:
              apiError.message ||
              "Campaign was created on blockchain but we couldn't save all details.",
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    submitToAPI();
  }, [txState, form, address, router]);

  return (
    <div className="relative min-h-screen">
      {/* Background with grid pattern and gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black"></div>
      </div>

      <div className="container px-4 sm:px-6 py-12 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Create a New Campaign
            </h1>
            <p className="text-gray-400">
              Set up your campaign and invite writers to contribute
            </p>
          </div>

          <Card className="bg-black/40 backdrop-blur-lg border-gray-800/40 overflow-hidden rounded-3xl transition-all duration-300 hover:border-gray-700/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Campaign Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fill in the details below to create your campaign. Be
                descriptive to attract writers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-gray-400 mb-2">
                    Please connect your wallet to create a campaign
                  </p>
                  <CustomConnectButton />
                </div>
              ) : isCheckingUser ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-500 border-t-white"></div>
                  <p className="text-gray-400">
                    Checking your account status...
                  </p>
                </div>
              ) : userExists === false ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-gray-400 mb-2">
                    You need to register before creating campaigns
                  </p>
                  <Button
                    onClick={() => router.push("/apps/account/register")}
                    variant="outline"
                    className="rounded-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
                  >
                    Register Now
                  </Button>
                </div>
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#060606]/80 p-1 rounded-full">
                    <TabsTrigger
                      value="details"
                      className="rounded-full data-[state=active]:bg-[#121212] data-[state=active]:text-cyan-400 transition-all duration-300"
                    >
                      Basic Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="requirements"
                      className="rounded-full data-[state=active]:bg-[#121212] data-[state=active]:text-cyan-400 transition-all duration-300"
                    >
                      Requirements
                    </TabsTrigger>
                    <TabsTrigger
                      value="media"
                      className="rounded-full data-[state=active]:bg-[#121212] data-[state=active]:text-cyan-400 transition-all duration-300"
                    >
                      Media
                    </TabsTrigger>
                  </TabsList>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-8"
                    >
                      <TabsContent
                        value="details"
                        className="space-y-6 animate-fade-in"
                      >
                        <FormFieldInput
                          formControl={form.control}
                          fieldName="title"
                          title="Campaign Title"
                          required={true}
                          placeholder="Enter your campaign title"
                        />

                        <FormFieldInput
                          formControl={form.control}
                          fieldName="description"
                          title="Campaign Description"
                          type="textarea"
                          rows={4}
                          placeholder="Describe what your campaign is about and what kind of articles you're looking for"
                          required={true}
                        />

                        <FormFieldInput
                          formControl={form.control}
                          fieldName="keywords"
                          title="Keywords"
                          placeholder="Enter keywords separated by commas"
                          icon={<Tag className="h-4 w-4" />}
                          description="Keywords help categorize your campaign"
                          required={true}
                        />

                        <FormFieldInput
                          formControl={form.control}
                          fieldName="rewardPool"
                          title="Reward Pool"
                          type="number"
                          placeholder="Enter reward amount"
                          description="Payment will be made in $BLOG tokens"
                          required={true}
                        />

                        {signError && (
                          <div className="rounded-lg bg-red-900/20 p-3 border border-red-800/30">
                            <p className="text-sm text-red-400">
                              Error signing message: {signError.message}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent
                        value="requirements"
                        className="space-y-6 animate-fade-in"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormFieldInput
                            formControl={form.control}
                            fieldName="startDate"
                            title="Start Date"
                            type="datetime-local"
                            icon={<Calendar className="h-4 w-4" />}
                            description="When the campaign starts"
                            required={true}
                            parentClassName="!flex flex-col"
                            className="!w-full flex-col-reverse"
                          />

                          <FormFieldInput
                            formControl={form.control}
                            fieldName="endDate"
                            title="End Date"
                            type="datetime-local"
                            icon={<Calendar className="h-4 w-4" />}
                            description="When the campaign ends"
                            required={true}
                            parentClassName="!flex flex-col"
                            className="!w-full flex-col-reverse"
                          />
                        </div>

                        <FormFieldInput
                          formControl={form.control}
                          fieldName="targetAudience"
                          title="Target Audience"
                          icon={<Users className="h-4 w-4" />}
                          description="Who this campaign is aimed at"
                          placeholder="Describe your target audience"
                        />

                        <FormFieldInput
                          formControl={form.control}
                          fieldName="ctaGoal"
                          title="Call-to-Action Goal"
                          description="The desired outcome for readers"
                          placeholder="What action should readers take?"
                        />

                        <FormFieldInput
                          formControl={form.control}
                          fieldName="aiDescription"
                          title="AI-Friendly Description"
                          type="textarea"
                          rows={3}
                          description="This description will be used for AI analysis"
                          placeholder="Describe your campaign in a way that can be used for AI analysis"
                        />
                      </TabsContent>

                      <TabsContent
                        value="media"
                        className="space-y-6 animate-fade-in"
                      >
                        <FormField
                          control={form.control}
                          name="coverImage"
                          render={({ field }) => (
                            <FormImageUpload
                              title="Campaign Cover Image"
                              description="Upload a cover image for your campaign (recommended size: 1200 × 630 pixels)"
                              field={field}
                            />
                          )}
                        />

                        {txState.isError && (
                          <TransactionErrorDisplay
                            error={txState.error}
                            onRetry={() => {
                              dispatchTx({ type: "RESET" });
                              form.handleSubmit(onSubmit)();
                            }}
                          />
                        )}

                        <div className="pt-2">
                          <div className="flex items-center space-x-2 rounded-lg bg-blue-900/20 p-3 border border-blue-800/30">
                            <div className="flex-shrink-0">
                              <Users className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="text-sm text-blue-300">
                              <strong>Connected Wallet:</strong> {address}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      {activeTab == "media" && (
                        <div className="flex justify-end space-x-4 pt-4">
                          <ButtonCreateCampaign
                            state={activeTab}
                            setState={setActiveTab}
                            isSubmitting={isSubmitting || isSignLoading}
                            form={form}
                          />
                        </div>
                      )}
                    </form>
                  </Form>
                  {activeTab !== "media" && (
                    <div className="flex justify-end space-x-4 pt-4">
                      <ButtonCreateCampaign
                        state={activeTab}
                        setState={setActiveTab}
                        isSubmitting={isSubmitting || isSignLoading}
                        form={form}
                      />
                    </div>
                  )}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
