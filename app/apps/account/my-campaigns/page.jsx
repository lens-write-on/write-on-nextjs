'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Search, ChevronRight, Settings, Calendar, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/hooks/use-user"

const CampaignCard = ({ campaign }) => {
  const statusColors = {
    ACTIVE: "text-emerald-400",
    ENDED: "text-gray-400",
    DRAFT: "text-amber-400",
    PENDING: "text-blue-400"
  }

  return (
    <Link href={`/apps/campaigns/${campaign.id}`}>
      <Card
        className="group bg-[#060606] border-gray-800/20 overflow-hidden rounded-3xl transition-all duration-500 hover:border-gray-700"
      >
        <div className="relative h-56 overflow-hidden">
          <img
            src={campaign.image || "/placeholder.svg"}
            alt={campaign.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <Badge 
            className={`absolute top-4 right-4 ${statusColors[campaign.status] || "text-gray-400"}`}
            variant="outline"
          >
            {campaign.status}
          </Badge>
        </div>
        
        <CardHeader className="pb-2 relative">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center text-sm text-cyan-400">
              <Users size={14} className="mr-1.5" />
              <span>{campaign.participants || 0} writers</span>
            </div>
            <div className="flex items-center text-sm text-emerald-400">
              <Calendar size={14} className="mr-1.5" />
              <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {campaign.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-gray-400 mt-2">
            {campaign.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="border-t border-gray-800 my-2 opacity-30"></div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Reward Pool</div>
              <div className="text-emerald-400 font-medium">{campaign.rewardPool} $BLOG</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Transaction</div>
              <div className="text-cyan-400 font-medium">
                {campaign.txHash ? "Confirmed" : "Pending"}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-4">
          <Button 
            className="w-full rounded-full transition-all duration-500 flex items-center justify-center" 
            variant={"outline"}
            size="lg"
          >
            <span className="mr-2">Manage Campaign</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}

const MyCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { userData } = useUser()

  useEffect(() => {
    async function fetchMyCampaigns() {
      if (!userData?.id) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/my-campaign?userId=${userData.id}`)
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch campaigns')
        }
        
        setCampaigns(result.data)
      } catch (err) {
        console.error("Error fetching my campaigns:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMyCampaigns()
  }, [userData?.id])

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative min-h-screen">
      {/* Background with grid pattern and gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black"></div>
      </div>

      <div className="container px-4 sm:px-6 py-12 relative z-10">
        {/* Header section with animation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              My Campaigns
            </h1>
            <p className="text-gray-400 text-lg">
              Manage the campaigns you've created
            </p>
          </div>

          <Button 
            className="mt-6 md:mt-0 rounded-full transition-all duration-300" 
            size="lg"
            variant={"outline"}
            asChild
          >
            <Link href="/apps/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Campaign
            </Link>
          </Button>
        </div>

        {/* Search section with glassmorphism */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 focus-visible:border-700" />
              <Input 
                placeholder="Search your campaigns..." 
                className="pl-12 py-6 border-gray-800/20 hover:border-gray-700 rounded-full backdrop-blur-lg text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-lg hover:bg-black/60 transition-all duration-300"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content area */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Spinner size="lg" className="text-emerald-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 backdrop-blur-sm bg-black/30 rounded-3xl border border-gray-800/20 hover:border-gray-700 transition-all duration-300">
            <p className="text-red-400 mb-6 text-xl">Error: {error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="rounded-full hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 backdrop-blur-sm rounded-3xl border border-gray-800/20 hover:border-gray-700 transition-all duration-300">
            <p className="text-gray-400 mb-6 text-xl">You haven't created any campaigns yet</p>
            <Button 
              variant={"secondary"}
              asChild
              className="rounded-full transition-all duration-300"
            >
              <Link href="/apps/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Your First Campaign
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCampaignsPage