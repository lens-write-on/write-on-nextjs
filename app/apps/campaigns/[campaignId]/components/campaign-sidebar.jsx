'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CampaignSidebar({ campaign }) {
  return (
    <Card className="bg-[#060606] border-gray-800/40 sticky top-8">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-1">Target Audience</h3>
          <p className="text-gray-200">{campaign.targetAudience || 'Not specified'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-1">Campaign Status</h3>
          <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-full">
            {campaign.status}
          </Badge>
        </div>

        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-1">Timeline</h3>
          <div className="text-gray-200">
            <div>Start: {new Date(campaign.startDate).toLocaleDateString()}</div>
            <div>End: {new Date(campaign.endDate).toLocaleDateString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}