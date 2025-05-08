'use client'
import { Card, CardContent } from "@/components/ui/card"

export default function RequirementsTab({ campaign }) {
  return (
    <Card className="bg-[#060606]/60 border-gray-800/40">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium mb-6">Submission Requirements</h2>
        <div className="space-y-4 text-gray-400">
          {campaign.requirements?.map((req, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/10 flex items-center justify-center text-xs font-medium text-emerald-400 flex-shrink-0">
                {index + 1}
              </div>
              <p>{req}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}