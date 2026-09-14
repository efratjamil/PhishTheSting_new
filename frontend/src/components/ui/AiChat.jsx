import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import Alert from "./Alert";
import { getAuthHeaders } from "../../utils/auth";
import { API_BASE_URL } from "../../config/apiConfig";

const quickQuestions = [
  "האם ההודעה הזו מסוכנת?",
  "למה זה נראה כמו פישינג?",
  "מה כדאי לעשות עכשיו?",
  "איזה סימנים מחשידים יש בהודעה?",
  "מה לעשות אם כבר לחצתי על הקישור?",
];

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderChatReply(text = "") {
  const normalizedText = String(text)
    .replace(/\\([*_`])/g, "$1")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
  const lines = normalizedText.split("\n");

  return lines.map((line, lineIndex) => {
    const displayLine = line.replace(/^\s*[-*]\s+/, "• ");
    const parts = displayLine.split(/(\*\*.+?\*\*)/g);

    return (
      <span key={`${lineIndex}-${displayLine}`}>
        {parts.map((part, partIndex) =>
          /^\*\*.+\*\*$/.test(part) ? (
            <strong key={`${lineIndex}-${partIndex}`}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          ),
        )}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function AiChat({ sourceMessage, analysisPayload }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const canSend = useMemo(
    () =>
      Boolean(question.trim()) && Boolean(sourceMessage?.trim()) && !isLoading,
    [isLoading, question, sourceMessage],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (customQuestion) => {
    const finalQuestion = (customQuestion || question).trim();

    if (!finalQuestion || !sourceMessage?.trim() || isLoading) {
      return;
    }

    const userMessage = {
      role: "user",
      text: finalQuestion,
      timestamp: Date.now(),
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/ai/chat`,
        {
          message: sourceMessage,
          analysis: analysisPayload,
          question: finalQuestion,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      setMessages((current) => [
        ...current,
        {
          role: "bot",
          text: data.reply || "לא התקבלה תשובה מהבוט.",
          timestamp: Date.now(),
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "שגיאה בקבלת תשובה מהבוט.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center space-x-3 text-lg font-semibold text-gray-900 rtl:space-x-reverse lg:text-xl">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
          <span className="flex items-center gap-2">
            <span>שאל את הצ'אט</span>
            <span className="group relative inline-flex">
              <button
                type="button"
                className="rounded-full text-slate-400 transition-colors hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="מידע על תשובות הבינה המלאכותית"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>

              <span className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-72 max-w-[80vw] rounded-xl bg-slate-900 px-3 py-2 text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                התשובות מבוססות בינה מלאכותית ונועדו לסייע בהבנת תוצאות
                הניתוח. יש להפעיל שיקול דעת ולא להסתמך עליהן בלבד.
              </span>
            </span>
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          {isOpen ? "סגור" : "פתח"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((quickQuestion) => (
                  <button
                    key={quickQuestion}
                    type="button"
                    onClick={() => sendMessage(quickQuestion)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    {quickQuestion}
                  </button>
                ))}
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <div className="rounded-2xl border border-gray-200 bg-slate-50">
                <div className="flex max-h-[360px] min-h-[240px] flex-col gap-3 overflow-y-auto p-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
                      שאלו את הבוט שאלה על ההודעה, והוא יסביר בצורה קצרה וברורה.
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${message.timestamp}-${index}`}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === "user"
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                        }`}
                      >
                        <p className="text-sm leading-6 whitespace-pre-wrap">
                          {message.role === "bot"
                            ? renderChatReply(message.text)
                            : message.text}
                        </p>
                        <p
                          className={`mt-2 text-[11px] ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-gray-400"
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="inline-flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                          </span>
                          <span>typing...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-200 bg-white p-3">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="כתבו שאלה על ההודעה..."
                      className="min-h-[52px] flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      dir="rtl"
                    />

                    <button
                      type="button"
                      onClick={() => sendMessage()}
                      disabled={!canSend}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      aria-label="שלח שאלה"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
