import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageCircle, Send } from "lucide-react";

import { askShipmentQuestion } from "../services/shipmentApi";
import type { ChatMessage } from "../types/shipment";

interface ShipmentChatProps {
  shipmentId: string;
  /** History already stored on the shipment (loaded with the page). */
  initialMessages: ChatMessage[];
}

/**
 * Follow-up Q&A scoped to one shipment. Answers are grounded in the
 * shipment's stored data via the backend's RAG endpoint.
 */
function ShipmentChat({ shipmentId, initialMessages }: ShipmentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Keep the latest message in view as the conversation grows.
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, sending]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = input.trim();
    if (!question || sending) return;

    setError("");
    setInput("");
    setSending(true);

    // Optimistic user turn; the assistant turn arrives with the response.
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question, timestamp: new Date().toISOString() },
    ]);

    try {
      const data = await askShipmentQuestion(shipmentId, question);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to get an answer.");
      } else {
        setError("Failed to get an answer.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="text-left">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-white/60" />
        <h2 className="m-0 text-base font-medium text-white sm:text-lg">
          Ask About This Shipment
        </h2>
      </div>

      {/* Message list */}
      {messages.length === 0 ? (
        <p className="mb-4 text-sm text-[var(--text)]">
          Ask a follow-up question - e.g. &quot;why is this high risk?&quot;
        </p>
      ) : (
        <ul className="m-0 mb-4 grid max-h-96 list-none gap-3 overflow-y-auto p-0">
          {messages.map((message, index) => (
            <li
              key={index}
              className={`animate-rise ${
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md border border-white/15 bg-white/12 px-4 py-2.5 text-sm text-white"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-[var(--text-h)]"
              }`}
            >
              <p className="m-0 whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </li>
          ))}

          {sending && (
            <li className="animate-rise mr-auto flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-black/20 px-4 py-3">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50"
                  style={{ animationDelay: `${dot * 150}ms` }}
                />
              ))}
            </li>
          )}
        </ul>
      )}

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question…"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:ring-1 focus:ring-white/20"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send question"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.97]"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-2.5 text-xs text-white/50">
        Answers are based only on this shipment's stored data.
      </p>
    </div>
  );
}

export default ShipmentChat;
