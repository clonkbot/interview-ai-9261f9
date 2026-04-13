import { RefObject } from "react";

interface Message {
  _id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
}

interface Props {
  messages: Message[];
  transcriptionRef: RefObject<HTMLDivElement>;
  isProcessing: boolean;
}

export function TranscriptionPanel({ messages, transcriptionRef, isProcessing }: Props) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-serif text-lg text-charcoal">Live Transcription</h3>
        <span className="text-xs text-gray-400">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      <div
        ref={transcriptionRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[300px] lg:min-h-0"
      >
        {messages.length === 0 && !isProcessing && (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Interview starting...
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`message-bubble ${
              message.role === "interviewer" ? "pr-8" : "pl-8"
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`flex gap-3 ${
              message.role === "candidate" ? "flex-row-reverse" : ""
            }`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                message.role === "interviewer"
                  ? "bg-cyan/20 text-cyan"
                  : "bg-charcoal/10 text-charcoal"
              }`}>
                {message.role === "interviewer" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              {/* Message content */}
              <div className={`flex-1 ${message.role === "candidate" ? "text-right" : ""}`}>
                <div className={`inline-block max-w-full text-left px-4 py-3 rounded-2xl ${
                  message.role === "interviewer"
                    ? "bg-gray-50 rounded-tl-sm"
                    : "bg-cyan/10 rounded-tr-sm"
                }`}>
                  <p className="text-charcoal text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${
                  message.role === "candidate" ? "text-right" : ""
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isProcessing && (
          <div className="message-bubble pr-8">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan/20 text-cyan flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-3 bg-gray-50 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
