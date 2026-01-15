/** biome-ignore-all lint/correctness/useUniqueElementIds: it's alright */
import { useEffect, useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Component imports
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { Toggle } from "@/components/toggle/Toggle";
import { MemoizedMarkdown } from "@/components/memoized-markdown";

// Icon imports
import {
  BugIcon,
  MoonIcon,
  RobotIcon,
  SunIcon,
  TrashIcon,
  PaperPlaneTiltIcon,
  PaperclipIcon
} from "@phosphor-icons/react";

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

interface LambdaResponse {
  response: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const LAMBDA_URL = import.meta.env.VITE_LAMBDA_URL;
const MY_AWS_SECRET = import.meta.env.VITE_AWS_SECRET;

export default function Chat() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "dark" | "light") || "dark";
  });
  const [showDebug, setShowDebug] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedPdf, setAttachedPdf] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobPostingUrl, setJobPostingUrl] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Apply theme class on mount and when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messages.length > 0 && scrollToBottom();
  }, [messages, scrollToBottom]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      textParts.push(pageText);
    }
    console.log(textParts.join("\n"));
    return textParts.join("\n");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setAttachedPdf(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachedPdf || isProcessing) return;

    setIsProcessing(true);

    // Add user message showing the attached file and URL
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: `Processing resume: ${attachedPdf.name}\nJob posting: ${jobPostingUrl || "(no URL provided)"}`,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const resumeText = await extractTextFromPdf(attachedPdf);
      console.log(LAMBDA_URL)
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        body: JSON.stringify({
          "secret": MY_AWS_SECRET,
          "resume_text": resumeText,
          "job_posting_url": jobPostingUrl
        })
      });

      const data: LambdaResponse = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.response,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `Error processing resume: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setAttachedPdf(null);
      setJobPostingUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setAttachedPdf(null);
    setJobPostingUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen w-full p-4 flex justify-center items-center bg-fixed overflow-hidden">
      <div className="h-[calc(100vh-2rem)] w-full mx-auto max-w-lg flex flex-col shadow-xl rounded-md overflow-hidden relative border border-neutral-300 dark:border-neutral-800">
        <div className="px-4 py-3 border-b border-neutral-300 dark:border-neutral-800 flex items-center gap-3 sticky top-0 z-10">
          <div className="flex items-center justify-center h-8 w-8">
            <svg
              width="28px"
              height="28px"
              data-icon="a3"
              viewBox="0 0 480.76368 416.35364"
            >
              <title>a³ - Apply Assist AI</title>
              <defs>
                <linearGradient id="linearGradient21">
                  <stop style={{ stopColor: "#000000", stopOpacity: 1 }} offset="0" />
                  <stop style={{ stopColor: "#000000", stopOpacity: 0 }} offset="1" />
                </linearGradient>
                <linearGradient
                  xlinkHref="#linearGradient21"
                  id="linearGradient22"
                  x1="514.54535"
                  y1="179.25133"
                  x2="517.88568"
                  y2="179.25133"
                  gradientUnits="userSpaceOnUse"
                />
              </defs>
              <g id="layer2" style={{ fill: "#ececec" }} transform="translate(-275.83372,-40.466781)">
                <path style={{ fill: "#ececec" }} d="M 516.21552,40.466781 502.05204,99.00636 476.8634,295.2967 v 0.0191 l 39.35212,22.72006 z" />
                <path style={{ fill: "#e6e6e6" }} d="M 516.21552,40.46679 530.379,99.006372 555.56764,295.29671 v 0.0191 l -39.35212,22.72006 z" />
              </g>
              <g id="use3" style={{ fill: "#ececec" }} transform="translate(-275.83372,-40.466781)">
                <path style={{ fill: "#999999" }} d="m 516.21552,40.466781 -1.67018,6.902937 V 317.0716 l 1.67018,0.96428 z" />
                <path style={{ fill: "#b3b3b3" }} d="M 516.21552,40.466781 V 318.03588 l 1.67018,-0.96428 V 47.369718 Z" />
              </g>
              <use xlinkHref="#layer2" transform="rotate(120,240.38179,277.54988)" />
              <use xlinkHref="#layer2" transform="rotate(-120,240.38179,277.56899)" />
              <use xlinkHref="#use3" style={{ fill: "url(#linearGradient22)" }} />
              <use xlinkHref="#use3" transform="rotate(120,240.38179,277.5691)" />
              <use xlinkHref="#use3" transform="rotate(-120,240.38179,277.56899)" />
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-base">a³ - Apply Assist AI</h2>
          </div>

          <div className="flex items-center gap-2 mr-2">
            <BugIcon size={16} />
            <Toggle
              toggled={showDebug}
              aria-label="Toggle debug mode"
              onClick={() => setShowDebug((prev) => !prev)}
            />
          </div>

          <Button
            variant="ghost"
            size="md"
            shape="square"
            className="rounded-full h-9 w-9"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </Button>

          <Button
            variant="ghost"
            size="md"
            shape="square"
            className="rounded-full h-9 w-9"
            onClick={clearHistory}
          >
            <TrashIcon size={20} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 max-h-[calc(100vh-10rem)]">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <Card className="p-6 max-w-md mx-auto bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center space-y-4">
                  <div className="bg-[#F48120]/10 text-[#F48120] rounded-full p-3 inline-flex">
                    <RobotIcon size={24} />
                  </div>
                  <h3 className="font-semibold text-lg">Resume Processor</h3>
                  <p className="text-muted-foreground text-sm">
                    Attach a PDF resume to get AI-powered analysis and feedback.
                  </p>
                  <ul className="text-sm text-left space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-[#F48120]">•</span>
                      <span>Click "Attach PDF" to select your resume</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#F48120]">•</span>
                      <span>Press send to process and get feedback</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          )}

          {messages.map((m, index) => {
            const isUser = m.role === "user";
            const showAvatar =
              index === 0 || messages[index - 1]?.role !== m.role;

            return (
              <div key={m.id}>
                {showDebug && (
                  <pre className="text-xs text-muted-foreground overflow-scroll">
                    {JSON.stringify(m, null, 2)}
                  </pre>
                )}
                <div
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {showAvatar && !isUser ? (
                      <Avatar username={"AI"} className="shrink-0" />
                    ) : (
                      !isUser && <div className="w-8" />
                    )}

                    <div>
                      <Card
                        className={`p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 ${
                          isUser
                            ? "rounded-br-none"
                            : "rounded-bl-none border-assistant-border text-justify"
                        }`}
                      >
                        <MemoizedMarkdown id={m.id} content={m.text} />
                      </Card>
                      <p
                        className={`text-xs text-muted-foreground mt-1 ${
                          isUser ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(m.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex justify-center items-center py-4">
              <div className="flex items-end justify-between w-[40px] h-[40px]">
                <style>
                  {`
                    @keyframes wave {
                      0%, 100% { height: 8px; }
                      50% { height: 40px; }
                    }
                  `}
                </style>
                <div
                  className="w-[8px] bg-[#F48120]"
                  style={{
                    animation: "wave 0.9s ease-in-out infinite",
                    animationDelay: "0s"
                  }}
                />
                <div
                  className="w-[8px] bg-[#F48120]"
                  style={{
                    animation: "wave 0.9s ease-in-out infinite",
                    animationDelay: "0.15s"
                  }}
                />
                <div
                  className="w-[8px] bg-[#F48120]"
                  style={{
                    animation: "wave 0.9s ease-in-out infinite",
                    animationDelay: "0.3s"
                  }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-neutral-50 absolute bottom-0 left-0 right-0 z-10 border-t border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="flex w-full border border-neutral-200 dark:border-neutral-700 px-3 pt-2 pb-10 ring-offset-background rounded-2xl min-h-[60px] items-start dark:bg-neutral-900">
                <input
                  type="text"
                  value={jobPostingUrl}
                  onChange={(e) => setJobPostingUrl(e.target.value)}
                  placeholder="Enter the job posting URL"
                  disabled={isProcessing}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </div>
              <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end items-center gap-2">
                {attachedPdf && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[150px]">
                    {attachedPdf.name}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                  aria-label="Attach PDF"
                >
                  <PaperclipIcon size={16} />
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                  disabled={!attachedPdf || isProcessing}
                  aria-label="Process resume"
                >
                  <PaperPlaneTiltIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
