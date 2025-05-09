'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CampaignSidebar from '../campaign-sidebar'

export default function OverviewTab({ campaign }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="bg-[#060606]/60 border-gray-800/40 backdrop-blur-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-medium mb-4">Campaign Description</h2>
            <p className="text-gray-400 whitespace-pre-wrap">{campaign.description}</p>
            
            {campaign.keywords && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.keywords.split(',').map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="rounded-full">
                      {keyword.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <CampaignSidebar campaign={campaign} />
      </div>
    </div>
  )
}