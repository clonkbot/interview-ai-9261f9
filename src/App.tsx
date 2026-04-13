import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { InterviewDashboard } from "./components/InterviewDashboard";
import "./styles.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="breathing-orb" />
          <p className="font-sans text-charcoal/60 text-sm tracking-wide">
            Initializing interview system...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <InterviewDashboard />;
}
