"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// Network speed detection
export interface NetworkInfo {
  speed: 'slow' | 'medium' | 'fast';
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

interface AnimatedMarkdownProps {
  content: string;
  isStreaming: boolean;
  networkSpeed: NetworkInfo;
}

export default function AnimatedMarkdown({ 
  content, 
  isStreaming, 
  networkSpeed 
}: AnimatedMarkdownProps) {
  const [displayedText, setDisplayedText] = useState("");
  const animationFrameRef = useRef<number | undefined>(undefined);
  const bufferRef = useRef<string>("");
  const lastUpdateRef = useRef<number>(0);
  
  const getAnimationSpeed = useCallback(() => {
    switch (networkSpeed.speed) {
      case 'slow':
        return 5; // characters per frame
      case 'medium':
        return 12;
      case 'fast':
        return 25;
      default:
        return 12;
    }
  }, [networkSpeed.speed]);
  
  useEffect(() => {
    bufferRef.current = content;
    
    if (!isStreaming) {
      setDisplayedText(content);
      return;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const animate = () => {
      const now = performance.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      
      if (timeSinceLastUpdate < 16) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastUpdateRef.current = now;
      
      const target = bufferRef.current;
      const current = displayedText;
      
      if (current.length < target.length) {
        const speed = getAnimationSpeed();
        const nextLength = Math.min(current.length + speed, target.length);
        setDisplayedText(target.slice(0, nextLength));
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayedText(target);
      }
    };
    
    if (bufferRef.current.length > displayedText.length) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [content, isStreaming, displayedText, getAnimationSpeed]);
  
  return (
    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-[#1b3a4b] prose-code:text-[#1b3a4b] prose-pre:bg-[#f8fafc] prose-pre:text-[#1b3a4b] prose-strong:text-[#1b3a4b] prose-a:text-[#006466] prose-ul:text-[#1b3a4b] prose-ol:text-[#1b3a4b]">
      <ReactMarkdown
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <pre className="max-w-full overflow-x-auto rounded-lg bg-[#f8fafc] p-3 text-xs border border-[#002829]/20">
                <code className={`${className} block overflow-x-auto whitespace-pre`} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                className="rounded bg-[#006466]/10 px-1.5 py-0.5 text-[10px] font-mono text-[#006466]"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }: any) => (
            <p className="mb-2 wrap-break-word text-xs leading-relaxed last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }: any) => (
            <ul className="mb-2 ml-4 list-disc space-y-1 wrap-break-word last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }: any) => (
            <ol className="mb-2 ml-4 list-decimal space-y-1 wrap-break-word last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }: any) => (
            <li className="wrap-break-word text-xs">{children}</li>
          ),
          h1: ({ children }: any) => (
            <h1 className="mb-2 wrap-break-word text-base font-semibold last:mb-0">
              {children}
            </h1>
          ),
          h2: ({ children }: any) => (
            <h2 className="mb-2 wrap-break-word text-sm font-semibold last:mb-0">
              {children}
            </h2>
          ),
          h3: ({ children }: any) => (
            <h3 className="mb-2 wrap-break-word text-xs font-semibold last:mb-0">
              {children}
            </h3>
          ),
          blockquote: ({ children }: any) => (
            <blockquote className="my-2 wrap-break-word border-l-4 border-[#006466]/30 pl-4 text-xs italic text-[#212f45]">
              {children}
            </blockquote>
          ),
          a: ({ children, href }: any) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="wrap-break-word text-xs text-[#006466] underline hover:text-[#005052]"
            >
              {children}
            </a>
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>
      {isStreaming && displayedText.length < content.length && (
        <span className="inline-block w-2 h-4 ml-1 bg-[#006466] animate-pulse" />
      )}
    </div>
  );
}
