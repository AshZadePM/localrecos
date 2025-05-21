import * as React from "react";
import { cn } from "@/lib/utils";

export interface SentimentBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number | null;
  summary: string;
}

const SentimentBox = React.forwardRef<HTMLDivElement, SentimentBoxProps>(
  ({ className, score, summary, ...props }, ref) => {
    let sentimentClass = "sentiment-neutral";
    
    if (score !== null) {
      if (score >= 0.7) {
        sentimentClass = "sentiment-positive";
      } else if (score <= 0.4) {
        sentimentClass = "sentiment-negative";
      }
    }
    
    return (
      <div 
        className={cn("p-3 rounded-md my-3", sentimentClass, className)} 
        ref={ref} 
        {...props}
      >
        <div className="font-medium mb-1">Community Sentiment</div>
        <p className="text-sm">{summary}</p>
      </div>
    );
  }
);

SentimentBox.displayName = "SentimentBox";

export { SentimentBox };
