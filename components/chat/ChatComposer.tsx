import { useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  input: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSend: (event?: FormEvent<HTMLFormElement>) => void;
  isDisabled: boolean;
  isLastQuestion: boolean;
  charLimit: number;
  suggestedQuestions?: string[];
}

export function ChatComposer({
  input,
  onInputChange,
  onSend,
  isDisabled,
  isLastQuestion,
  charLimit,
  suggestedQuestions = [],
}: ChatComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmitWithFocus = (e?: FormEvent<HTMLFormElement>) => {
    onSend(e);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <form
      onSubmit={handleSubmitWithFocus}
      className="flex flex-col gap-1 px-4 py-3 border-t border-white/10 glass-card"
    >
      {isLastQuestion ? (
        <p className="font-body text-sm text-amber-400 text-center mb-1" role="status">
          Last question — make it count!
        </p>
      ) : null}

      {suggestedQuestions.length > 0 && !isDisabled ? (
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestedQuestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                onInputChange({ target: { value: prompt } } as ChangeEvent<HTMLInputElement>);
                inputRef.current?.focus();
              }}
              className={cn(
                "font-body text-sm px-3 py-1.5 rounded-none",
                "border border-springpod-green/50 text-gray-400 hover:text-springpod-green hover:border-springpod-green",
                "transition-colors focus-visible:ring-2 focus-visible:ring-springpod-green"
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <span
          className="font-body text-springpod-green text-xl shrink-0"
          aria-hidden="true"
        >
          &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={onInputChange}
          placeholder="Ask a question…"
          disabled={isDisabled}
          maxLength={charLimit}
          aria-label="Type your interview question"
          aria-describedby={input.length > 0 ? "char-count" : undefined}
          className={cn(
            "flex-1 bg-transparent border-none outline-none min-w-0",
            "font-body text-base text-white placeholder:text-gray-600",
            "focus-visible:ring-0",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={isDisabled || !input.trim()}
          aria-label="Send message"
          className={cn(
            "font-heading text-sm text-springpod-green shrink-0",
            "px-3 py-1 border border-springpod-green shadow-green-glow",
            "hover:bg-springpod-green hover:text-black transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus-visible:ring-2 focus-visible:ring-springpod-green"
          )}
        >
          SEND
        </button>
      </div>
      {input.length > 0 ? (
        <div
          id="char-count"
          className={cn(
            "font-body text-sm text-right pr-12",
            input.length >= charLimit
              ? "text-amber-400"
              : input.length >= charLimit - 100
                ? "text-gray-500"
                : "text-gray-600"
          )}
          aria-live="polite"
        >
          {input.length}/{charLimit}
        </div>
      ) : null}
    </form>
  );
}
