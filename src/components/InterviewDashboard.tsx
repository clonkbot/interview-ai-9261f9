import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { InterviewSession } from "./InterviewSession";
import { NewInterviewModal } from "./NewInterviewModal";
import { InterviewHistory } from "./InterviewHistory";
import { Id } from "../../convex/_generated/dataModel";

export function InterviewDashboard() {
  const { signOut } = useAuthActions();
  const activeInterview = useQuery(api.interviews.getActive);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<Id<"interviews"> | null>(null);

  // If there's an active interview, show the session
  if (activeInterview) {
    return <InterviewSession interviewId={activeInterview._id} />;
  }

  // If viewing a past interview
  if (selectedInterviewId) {
    return (
      <InterviewSession
        interviewId={selectedInterviewId}
        onBack={() => setSelectedInterviewId(null)}
        isReview
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="ai-avatar w-10 h-10 before:!rounded-xl before:!inset-0"
                 style={{ width: '40px', height: '40px' }} />
            <h1 className="font-serif text-xl text-charcoal">
              Interview<span className="text-cyan">AI</span>
            </h1>
          </div>
          <button
            onClick={() => signOut()}
            className="btn-secondary px-4 py-2 rounded-lg text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 fade-in-up">
          <h2 className="font-serif text-3xl md:text-5xl text-charcoal mb-4">
            Ready to practice?
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto mb-8">
            Start a mock interview session with our AI interviewer.
            Get real-time feedback and improve your responses.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-cyan px-8 py-4 rounded-xl font-medium text-lg inline-flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Start New Interview
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-2">Live Transcription</h3>
            <p className="text-gray-500 text-sm">
              Your responses are transcribed in real-time so you can review and improve.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-2">AI Feedback</h3>
            <p className="text-gray-500 text-sm">
              Get instant analysis on your answers with actionable improvement tips.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-charcoal/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-2">Track Progress</h3>
            <p className="text-gray-500 text-sm">
              Review past interviews and watch your interview skills grow over time.
            </p>
          </div>
        </div>

        {/* Interview History */}
        <InterviewHistory onSelect={setSelectedInterviewId} />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-gray-200">
        <p className="footer-text">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>

      {/* New Interview Modal */}
      {showNewModal && (
        <NewInterviewModal onClose={() => setShowNewModal(false)} />
      )}
    </div>
  );
}
