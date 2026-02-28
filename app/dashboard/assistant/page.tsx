"use client"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED = [
  "Quelles déductions puis-je réclamer pour mes enfants ?",
  "Comment fonctionne la réduction titres-services ?",
  "Quel est le plafond de l\u2019épargne pension ?",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis Magi, votre assistant fiscal intelligent. Comment puis-je vous aider aujourd\u2019hui ?",
    },
  ])
  const [input, setInput] = useState("")

  const sendMessage = (text?: string) => {
    const msg = text || input
    if (!msg.trim()) return

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      {
        role: "assistant",
        content:
          "Merci pour votre question. Cette fonctionnalité sera bientôt disponible avec une intégration IA complète. En attendant, n\u2019hésitez pas à consulter notre module d\u2019optimisation fiscale pour une analyse détaillée de votre situation.",
      },
    ])
    setInput("")
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
          Assistant IA
        </h1>
        <p className="mt-1 text-muted-foreground">
          {"Posez vos questions fiscales à Magi."}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-accent" />
                    <span className="text-xs font-semibold text-accent">
                      Magi
                    </span>
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Posez votre question..."
          className="flex-1"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          size="icon"
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
