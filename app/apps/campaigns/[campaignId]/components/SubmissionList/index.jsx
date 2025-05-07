import { useState, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, MessageSquare, ThumbsUp, UserCheck, ExternalLink } from "lucide-react";
import AnimatedList from '../AnimatedList';
import './SubmissionList.css';

// Parse JSON data from submission if needed
const parseSubmissionData = (submission) => {
  if (!submission.data) return null;
  try {
    return typeof submission.data === 'string' ? JSON.parse(submission.data) : submission.data;
  } catch (e) {
    console.error("Error parsing submission data:", e);
    return null;
  }
};

// Get submission title or a fallback
const getSubmissionTitle = (submission) => {
  const parsedData = parseSubmissionData(submission);
  return parsedData?.result?.contentUrl || submission.blog_url || 'Untitled Submission';
};

// Get submission excerpt
const getSubmissionExcerpt = (submission) => {
  const parsedData = parseSubmissionData(submission);
  const scoreData = parsedData?.result?.score;
  
  if (scoreData) {
    return `Quality: ${scoreData.quality_score}/100 - ${scoreData.quality_reason?.substring(0, 100)}...`;
  }
  
  return "No content preview available";
};

// Format date to readable string
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (e) {
    return "Invalid date";
  }
};

const SubmissionItem = ({ submission, isSelected, onClick, isOwner }) => {
  const parsedData = parseSubmissionData(submission);
  const scoreData = parsedData?.result?.score;
  
  return (
    <Card 
      className={`submission-item group bg-[#060606] border-gray-800/20 overflow-hidden rounded-xl transition-all duration-300 hover:border-gray-700 ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-sm text-cyan-400">
            <UserCheck size={14} className="mr-1.5" />
            <span>{submission.user?.username || "Anonymous"}</span>
          </div>
          <div className="flex items-center text-sm text-emerald-400">
            <Calendar size={14} className="mr-1.5" />
            <span>{formatDate(submission.createdAt)}</span>
          </div>
        </div>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center justify-between">
          <span className="truncate mr-2">{getSubmissionTitle(submission)}</span>
          {submission.blog_url && (
            <a 
              href={submission.blog_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={e => e.stopPropagation()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <CardDescription className="line-clamp-2 text-gray-400">
          {getSubmissionExcerpt(submission)}
        </CardDescription>
        
        <div className="border-t border-gray-800 my-3 opacity-30"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {submission.total_score && (
              <div className="flex items-center text-white text-sm font-medium">
                Score: {submission.total_score}
              </div>
            )}
          </div>
          <Badge className={`${getStatusColor(submission.status)}`}>
            {formatStatus(submission.status)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to determine badge color based on status
function getStatusColor(status) {
  if (!status) return 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/20';
  
  switch (status.toLowerCase()) {
    case 'accepted':
    case 'approved':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20';
    case 'pending':
    case 'review':
      return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20';
    case 'rejected':
    case 'declined':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20';
    case 'draft':
      return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border-gray-500/20';
  }
}

// Format status text for display
function formatStatus(status) {
  if (!status) return 'Unknown';
  
  // Converting from database format (likely uppercase) to Title Case
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default function SubmissionList({ submissions = [], onSubmissionSelect, className = '', isOwner }) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleSelect = (submission, index) => {
    setSelectedIndex(index);
    if (onSubmissionSelect) {
      onSubmissionSelect(submission);
    }
  };

  // Render submission items through the AnimatedList component
  return (
    <div className={`submission-list-container ${className}`}>
      
      {submissions.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-16 backdrop-blur-sm bg-black/30 rounded-xl border border-gray-800/20">
          <p className="text-gray-400 mb-6">No submissions found</p>
          <Button variant="secondary" className="rounded-full">
            <Edit className="mr-2 h-4 w-4" />
            Create Your First Submission
          </Button>
        </div>
      ) : (
        <AnimatedList
          items={submissions}
          onItemSelect={handleSelect}
          initialSelectedIndex={selectedIndex}
          enableArrowNavigation={true}
          showGradients={true}
          displayScrollbar={true}
          className="custom-animated-list"
          renderItem={(submission, index, isSelected) => (
            <SubmissionItem 
              submission={submission} 
              isSelected={isSelected} 
              onClick={() => handleSelect(submission, index)} 
            />
          )}
        />
      )}
    </div>
  );
}