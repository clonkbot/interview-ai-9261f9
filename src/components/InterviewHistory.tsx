import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Interview {
  _id: Id<"interviews">;
  title: string;
  role: string;
  status: "active" | "completed" | "paused";
  startedAt: number;
  endedAt?: number;
}

interface Props {
  onSelect: (id: Id<"interviews">) => void;
}

export function InterviewHistory({ onSelect }: Props) {
  const interviews = useQuery(api.interviews.list);

  if (interviews === undefined) {
    return (
      <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-serif text-xl text-charcoal mb-4">Past Interviews</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedInterviews = interviews.filter((i: Interview) => i.status === "completed");

  if (completedInterviews.length === 0) {
    return (
      <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-serif text-xl text-charcoal mb-4">Past Interviews</h3>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500">
            No completed interviews yet. Start your first session!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="font-serif text-xl text-charcoal mb-4">Past Interviews</h3>
      <div className="space-y-3">
        {completedInterviews.map((interview: Interview) => (
          <button
            key={interview._id}
            onClick={() => onSelect(interview._id)}
            className="card p-4 w-full text-left hover:border-cyan"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-charcoal mb-1">{interview.title}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                    {interview.role}
                  </span>
                  <span>
                    {new Date(interview.startedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {interview.endedAt && (
                    <span>
                      {Math.round((interview.endedAt - interview.startedAt) / 60000)} min
                    </span>
                  )}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
