"use client"
import { useState, useEffect } from "react"
import { UserIcon, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import FormFieldInput from "@/components/FormFieldInput"
import FormImageUpload from "@/components/FormImageUpload"
import { useAccount, useSignMessage } from "wagmi"
import { CustomConnectButton } from "@/components/wallet/CustomConnectButton"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters long"),
  bio: z.string().optional(),
  image: z.any().optional()
})

export default function ProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const { address, isConnected } = useAccount()
  const { data: signatureData, error: signError, isLoading: isSignLoading, signMessage } = useSignMessage()
  const router = useRouter()
  const { userExists, userData, setUserData } = useUser()
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      bio: "",
      image: undefined,
    },
    mode: "onSubmit",
  });

  // Fetch user data if connected
  useEffect(() => {
    async function fetchUserData() {
      if (isConnected && address) {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/users?walletAddress=${address}`)
          const data = await response.json()
          
          if (data.success && data.exists) {
            // Populate form with existing user data
            form.reset({
              username: data.user.username || "",
              bio: data.user.bio || "",
              // Don't set image here as it's a file input
            })
            
            // Store the current image path if it exists
            setUserData(data.user)
          } else if (!data.exists) {
            // Redirect to registration if user doesn't exist
            toast({
              variant: "destructive",
              title: "Profile not found",
              description: "Please register an account first.",
            })
            router.push("/apps/account/register")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast({
            variant: "destructive",
            title: "Error loading profile",
            description: "Failed to load your profile data. Please try again.",
          })
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [address, isConnected, form, router, setUserData])

  // Add countdown effect after successful update
  useEffect(() => {
    let intervalId;
    
    if (updateSuccess) {
      intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            router.push("/apps");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [updateSuccess, router]);

  async function onSubmit(values) {
    if (!isConnected || !address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to update your profile.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Sign message to confirm identity
      const messageToSign = `Update profile with username: ${values.username} and wallet: ${address}`
      const signature = await new Promise((resolve, reject) => {
        signMessage({ message: messageToSign }, { 
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error)
        })
      })
      
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'image') {
          if (value && typeof value !== 'string') {
            formData.append('image', value)
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
        }
      })

      // Add wallet address and signature to form data
      formData.append('walletAddress', address)
      formData.append('signature', signature)
      formData.append('signedMessage', messageToSign)

      const response = await fetch('/api/users', {
        method: 'PUT',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUpdateSuccess(true)
        // Update user data in context
        setUserData(data.user)
        toast({
          title: "Profile updated!",
          description: `Your profile has been updated successfully. Redirecting in ${countdown} seconds...`,
        })
      } else {
        throw new Error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="container px-4 sm:px-6 py-12">
        <Card className="bg-black/40 backdrop-blur-lg border-gray-800/40 max-w-md mx-auto">
          <CardContent className="pt-6 px-6">
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Wallet Not Connected</h2>
              <p className="text-gray-400 mb-4">Please connect your wallet to view and edit your profile</p>
              <CustomConnectButton />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background with grid pattern and gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black"></div>
      </div>

      <div className="container px-4 sm:px-6 py-12 relative z-10">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Edit Your Profile
            </h1>
            <p className="text-gray-400">
              Update your profile information
            </p>
          </div>

          {updateSuccess ? (
            <Card className="bg-black/40 backdrop-blur-lg border-gray-800/40 overflow-hidden rounded-3xl transition-all duration-300 hover:border-gray-700/60 shadow-lg">
              <CardContent className="pt-6 px-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Profile Updated!</h2>
                  <p className="text-gray-400 mb-6">Your profile has been updated successfully</p>
                  <div className="text-cyan-400 text-lg font-medium">
                    Redirecting to dashboard in <span className="font-bold">{countdown}</span> seconds...
                  </div>
                  <Button 
                    onClick={() => router.push("/apps")}
                    variant="outline"
                    className="mt-6 rounded-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
                  >
                    Go to Dashboard Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black/40 backdrop-blur-lg border-gray-800/40 overflow-hidden rounded-3xl transition-all duration-300 hover:border-gray-700/60 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Edit Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-6 animate-fade-in">
                        <FormFieldInput
                          formControl={form.control}
                          fieldName="username"
                          title="Username"
                          required={true}
                          placeholder="Enter your username"
                          icon={<UserIcon className="h-4 w-4" />}
                        />

                        <FormFieldInput
                          formControl={form.control}
                          fieldName="bio"
                          title="About You"
                          type="textarea"
                          rows={3}
                          placeholder="Tell us a bit about yourself"
                          icon={<FileText className="h-4 w-4" />}
                        />

                        <FormField
                          control={form.control}
                          name="image"
                          render={({ field }) => (
                            <FormImageUpload
                              title="Profile Picture"
                              description="Upload a new profile picture"
                              field={field}
                              currentImage={userData?.image ? userData.image : undefined}
                              isSquare={true}
                            />
                          )}
                        />

                        <div className="pt-2">
                          <div className="flex items-center space-x-2 rounded-lg bg-blue-900/20 p-3 border border-blue-800/30">
                            <div className="flex-shrink-0">
                              <UserIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="text-sm text-blue-300">
                              <strong>Connected Wallet:</strong> {address}
                            </div>
                          </div>
                        </div>
                        
                        {signError && (
                          <div className="rounded-lg bg-red-900/20 p-3 border border-red-800/30">
                            <p className="text-sm text-red-400">
                              Error signing message: {signError.message}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-4 pt-4">
                        <Button 
                          type="button" 
                          onClick={() => router.push("/apps")}
                          variant="ghost"
                          className="rounded-full px-6 py-5"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || isSignLoading} 
                          variant="outline"
                          className="rounded-full px-8 py-6 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-700/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(8,145,178,0.2)]"
                        >
                          {isSubmitting || isSignLoading ? (
                            <>
                              <span className="mr-2">{isSignLoading ? "Signing..." : "Updating..."}</span>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white"></div>
                            </>
                          ) : (
                            "Update Profile"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}