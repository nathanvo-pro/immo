"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar
        className={cn(
          "w-8 h-8 shrink-0 ring-1",
          isUser
            ? "ring-[#BDA18A]/30 bg-[#C49D83]"
            : "ring-[#D5CABC] bg-[#f5efe6]"
        )}
      >
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-[#C49D83] text-[#f5efe6]"
              : "bg-[#f5efe6] text-[#C49D83]"
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-gradient-to-br from-[#C49D83] to-[#BDA18A] text-[#f5efe6] rounded-tr-sm shadow-[#C49D83]/10"
            : "bg-[#f5efe6] text-[#C49D83] border border-[#D5CABC] rounded-tl-sm"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
