import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Props {
  onClose: () => void;
}

const ROLE_PRESETS = [
  { label: "Software Engineer", value: "Software Engineer" },
  { label: "Product Manager", value: "Product Manager" },
  { label: "Data Scientist", value: "Data Scientist" },
  { label: "UX Designer", value: "UX Designer" },
  { label: "Marketing Manager", value: "Marketing Manager" },
  { label: "Sales Representative", value: "Sales Representative" },
];

export function NewInterviewModal({ onClose }: Props) {
  const createInterview = useMutation(api.interviews.create);
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalRole = role === "custom" ? customRole : role;
    const finalTitle = title || `${finalRole} Interview`;

    try {
      await createInterview({
        title: finalTitle,
        role: finalRole,
      });
      onClose();
    } catch (err) {
      console.error("Failed to create interview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-charcoal transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-serif text-2xl text-charcoal mb-2">
          New Interview Session
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Set up your practice interview environment
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
              Session Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Google PM Round 1"
              className="input-field w-full px-4 py-3 rounded-lg text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-3">
              Target Role
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setRole(preset.value)}
                  className={`px-4 py-3 rounded-lg text-sm text-left transition-all ${
                    role === preset.value
                      ? "bg-cyan text-charcoal font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRole("custom")}
              className={`w-full px-4 py-3 rounded-lg text-sm text-left transition-all ${
                role === "custom"
                  ? "bg-cyan text-charcoal font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Custom Role...
            </button>

            {role === "custom" && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter your target role"
                className="input-field w-full px-4 py-3 rounded-lg text-charcoal mt-3"
                autoFocus
              />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !role || (role === "custom" && !customRole)}
              className="btn-cyan flex-1 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                  Starting...
                </span>
              ) : (
                "Start Interview"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
