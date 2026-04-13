import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Waveform } from "./Waveform";
import { TranscriptionPanel } from "./TranscriptionPanel";

interface Message {
  _id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
}

interface Props {
  interviewId: Id<"interviews">;
  onBack?: () => void;
  isReview?: boolean;
}

export function InterviewSession({ interviewId, onBack, isReview }: Props) {
  const interview = useQuery(api.interviews.get, { id: interviewId });
  const messages = useQuery(api.messages.listByInterview, { interviewId });
  const addMessage = useMutation(api.messages.add);
  const updateStatus = useMutation(api.interviews.updateStatus);
  const chat = useAction(api.ai.chat);
  const textToSpeech = useAction(api.ai.textToSpeech);

  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const transcriptionRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll transcription
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [messages]);

  // Generate initial greeting
  useEffect(() => {
    if (!interview || isReview || hasInitialized.current || messages === undefined) return;
    if (messages.length === 0) {
      hasInitialized.current = true;
      generateAiResponse(true);
    }
  }, [interview, messages, isReview]);

  const pcmToWav = (base64Pcm: string): string => {
    const pcm = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
    const sampleRate = 24000;
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const w = (o: number, s: string) => s.split('').forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true);
    w(8, 'WAVE'); w(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
    view.setUint16(34, 16, true); w(36, 'data');
    view.setUint32(40, pcm.length, true);
    const wav = new Uint8Array(44 + pcm.length);
    wav.set(new Uint8Array(header), 0);
    wav.set(pcm, 44);
    return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
  };

  const playAudio = async (text: string) => {
    try {
      setIsAiSpeaking(true);
      const audioBase64 = await textToSpeech({ text, voice: "Kore" });
      if (audioBase64) {
        const audioUrl = pcmToWav(audioBase64);
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        audio.onended = () => {
          setIsAiSpeaking(false);
          setCurrentAudio(null);
        };
        await audio.play();
      } else {
        setIsAiSpeaking(false);
      }
    } catch (err) {
      console.error("TTS error:", err);
      setIsAiSpeaking(false);
    }
  };

  const generateAiResponse = useCallback(async (isGreeting = false) => {
    if (!interview) return;
    setIsProcessing(true);
    setError(null);

    try {
      const conversationHistory = messages?.map((m: Message) => ({
        role: m.role === "interviewer" ? "assistant" as const : "user" as const,
        content: m.content
      })) || [];

      const systemPrompt = `You are a professional interviewer conducting an interview for a ${interview.role} position.
${isGreeting
  ? "Start by introducing yourself briefly and asking the first interview question. Be warm but professional."
  : "Continue the interview naturally. Ask follow-up questions based on their responses. Be encouraging but also probe deeper when appropriate. Keep responses concise (2-3 sentences max) and end with a question."}
Keep your responses natural and conversational. Focus on behavioral and situational questions.`;

      const response = await chat({
        messages: isGreeting ? [] : conversationHistory,
        systemPrompt
      });

      await addMessage({
        interviewId,
        role: "interviewer",
        content: response
      });

      // Play audio response
      await playAudio(response);

    } catch (err) {
      console.error("AI error:", err);
      setError("Failed to generate response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [interview, messages, chat, addMessage, interviewId]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing || isAiSpeaking) return;

    const message = userInput.trim();
    setUserInput("");

    try {
      await addMessage({
        interviewId,
        role: "candidate",
        content: message
      });

      // Generate AI response
      await generateAiResponse();
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
  };

  const handleEndInterview = async () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    await updateStatus({ id: interviewId, status: "completed" });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would use Web Speech API for transcription
    if (!isRecording) {
      setError("Voice input coming soon! Type your response for now.");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!interview || messages === undefined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="breathing-orb" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(onBack || isReview) && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-gray-500 hover:text-charcoal transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="font-serif text-lg text-charcoal">{interview.title}</h1>
              <p className="text-xs text-gray-500">{interview.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isReview && interview.status === "active" && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-coral/10 rounded-full">
                  <div className="recording-pulse" />
                  <span className="text-xs font-medium text-coral">LIVE</span>
                </div>
                <button
                  onClick={handleEndInterview}
                  className="btn-secondary px-4 py-2 rounded-lg text-sm"
                >
                  End Interview
                </button>
              </>
            )}
            {isReview && (
              <span className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                REVIEW MODE
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        {/* Video / AI Avatar Section */}
        <div className="lg:w-1/2 p-4 md:p-6 flex flex-col">
          {/* AI Interviewer Card */}
          <div className="card flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[300px] lg:min-h-0">
            {/* Background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent" />

            {/* AI Avatar */}
            <div className="relative mb-6">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan to-emerald-400 flex items-center justify-center transition-all duration-500 ${
                isAiSpeaking ? 'scale-105 shadow-2xl shadow-cyan/30' : ''
              }`}>
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-cream flex items-center justify-center">
                  {isAiSpeaking ? (
                    <Waveform />
                  ) : (
                    <svg className="w-12 h-12 md:w-16 md:h-16 text-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isProcessing
                  ? 'bg-amber-100 text-amber-700'
                  : isAiSpeaking
                    ? 'bg-cyan/20 text-cyan'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {isProcessing ? 'Thinking...' : isAiSpeaking ? 'Speaking...' : 'Listening'}
              </div>
            </div>

            <h2 className="font-serif text-xl text-charcoal mb-1">AI Interviewer</h2>
            <p className="text-gray-500 text-sm">
              {interview.role} Interview Session
            </p>

            {/* Audio controls placeholder */}
            {isAiSpeaking && currentAudio && (
              <button
                onClick={() => {
                  currentAudio.pause();
                  setIsAiSpeaking(false);
                  setCurrentAudio(null);
                }}
                className="mt-4 btn-secondary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                Stop Audio
              </button>
            )}
          </div>
        </div>

        {/* Transcription Section */}
        <div className="lg:w-1/2 p-4 md:p-6 flex flex-col">
          <TranscriptionPanel
            messages={messages}
            transcriptionRef={transcriptionRef}
            isProcessing={isProcessing}
          />

          {/* Input Area */}
          {!isReview && interview.status === "active" && (
            <div className="mt-4">
              {error && (
                <div className="mb-3 px-4 py-2 bg-coral/10 border border-coral/20 rounded-lg text-sm text-coral">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                {/* Mic button */}
                <button
                  onClick={toggleRecording}
                  disabled={isProcessing || isAiSpeaking}
                  className={`p-4 rounded-xl transition-all ${
                    isRecording
                      ? 'bg-coral text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Text input */}
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your response..."
                    disabled={isProcessing || isAiSpeaking}
                    className="input-field flex-1 px-4 py-3 rounded-xl disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isProcessing || isAiSpeaking}
                    className="btn-cyan px-6 py-3 rounded-xl disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-2 text-center">
                Press Enter to send or click the microphone for voice input
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center border-t border-gray-200">
        <p className="footer-text">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
