'use client'
import { useState, useEffect, use } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAccount } from 'wagmi'
import { useUser } from '@/hooks/use-user'
import { RewardStatusProvider } from './components/providers/reward-status-provider'
import { SubmissionProvider } from './components/providers/submission-provider'
import CampaignHeader from './components/campaign-header'
import OverviewTab from './components/tabs/overview-tab'
import RequirementsTab from './components/tabs/requirements-tab'
import SubmissionsTab from './components/tabs/submissions-tab'
import { isCampaignEnded } from "@/lib/utils";

export default function CampaignDetailPage({ params }) {
  const resolvedParams = use(params)
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview");
  const [isCampaignActive, setIsCampaignActive] = useState(true)

  const { address } = useAccount()
  const { userData } = useUser()
  const isOwner = campaign?.ownerId === userData?.id

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/get?id=${resolvedParams.campaignId}`)
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch campaign')
        }
        
        setCampaign(result.data);

        const act = !isCampaignEnded(result.data.endDate);
        console.log(`campaign Active`, act )
        setIsCampaignActive(act)
      } catch (err) {
        console.error("Error fetching campaign:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [resolvedParams.campaignId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" className="text-emerald-400" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-400 mb-6 text-xl">Error: {error || 'Campaign not found'}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="rounded-full hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pt-14 bg-black">
      {campaign.campaignAddress && (
        <RewardStatusProvider campaignAddress={campaign.campaignAddress}>
          <SubmissionProvider campaignId={resolvedParams.campaignId} address={address}>
            <CampaignHeader campaign={campaign} isOwner={isOwner} isCampaignActive={isCampaignActive} />

            <div className="container mx-auto px-4 py-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full max-w-3xl mx-auto mb-8 bg-[#0a0a0a] border-gray-800/40">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
                  <TabsTrigger value="submissions" className="flex-1">Submissions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                  <OverviewTab campaign={campaign}   isCampaignActive={isCampaignActive}/>
                </TabsContent>

                <TabsContent value="requirements" className="mt-0">
                  <RequirementsTab campaign={campaign}  isCampaignActive={isCampaignActive} />
                </TabsContent>

                <TabsContent value="submissions" className="mt-0">
                  <SubmissionsTab campaign={campaign}  isCampaignActive={isCampaignActive} />
                </TabsContent>
              </Tabs>
            </div>
          </SubmissionProvider>
        </RewardStatusProvider>
      )}
      {!campaign.campaignAddress && (
        <SubmissionProvider campaignId={resolvedParams.campaignId}>
          <CampaignHeader campaign={campaign} isOwner={isOwner} isCampaignActive={isCampaignActive} />

          <div className="container mx-auto px-4 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-3xl mx-auto mb-8 bg-[#0a0a0a] border-gray-800/40">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
                <TabsTrigger value="submissions" className="flex-1">Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <OverviewTab campaign={campaign}  isCampaignActive={isCampaignActive}/>
              </TabsContent>

              <TabsContent value="requirements" className="mt-0">
                <RequirementsTab campaign={campaign}  isCampaignActive={isCampaignActive}/>
              </TabsContent>

              <TabsContent value="submissions" className="mt-0">
                <SubmissionsTab campaign={campaign}  isCampaignActive={isCampaignActive}/>
              </TabsContent>
            </Tabs>
          </div>
        </SubmissionProvider>
      )}
    </div>
  )
}