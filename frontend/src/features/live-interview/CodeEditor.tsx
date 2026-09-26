import Editor from "@monaco-editor/react"
import { useState, useCallback } from "react"
import { ChevronDown, RotateCcw, Copy, Check, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STARTERS: Record<string, string> = {
  python: `# Write your solution below
from typing import List, Optional

def solve():
    pass

# Example usage
if __name__ == "__main__":
    solve()
`,
  javascript: `/**
 * Write your solution below
 */
function solve(input) {
    
}

console.log(solve());
`,
  typescript: `/**
 * Write your solution below
 */
function solve(input: unknown): unknown {
    
}

console.log(solve(null));
`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
    }

    public void solve() {
        // Write your solution here
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    void solve() {
        // Write your solution here
    }
};

int main() {
    Solution sol;
    sol.solve();
    return 0;
}
`,
}

const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  cpp: "C++",
}

interface CodeEditorProps {
  onCodeChange?: (code: string) => void
  disabled?: boolean
  className?: string
}

export function CodeEditor({ onCodeChange, disabled, className }: CodeEditorProps) {
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(STARTERS.python)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLanguageChange = useCallback(
    (lang: string) => {
      setLanguage(lang)
      setCode(STARTERS[lang])
      onCodeChange?.(STARTERS[lang])
      setShowLangMenu(false)
    },
    [onCodeChange]
  )

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const v = value ?? ""
      setCode(v)
      onCodeChange?.(v)
    },
    [onCodeChange]
  )

  const handleReset = () => {
    setCode(STARTERS[language])
    onCodeChange?.(STARTERS[language])
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#1e1e1e]", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#252526]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu((v) => !v)}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <span className="font-mono text-emerald-400">{LANGUAGE_LABELS[language]}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {showLangMenu && (
              <div className="absolute left-0 top-full z-50 mt-1 w-36 rounded-xl border border-white/10 bg-[#2d2d2d] py-1 shadow-xl">
                {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleLanguageChange(key)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-xs font-mono transition-colors hover:bg-white/10",
                      language === key ? "text-emerald-400" : "text-zinc-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-white/10" />
          <span className="text-[10px] text-zinc-500 font-mono">{code.split("\n").length} lines</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            disabled={disabled}
            title="Copy code"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            disabled={disabled}
            title="Reset to starter template"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="320px"
        language={language === "cpp" ? "cpp" : language}
        value={code}
        onChange={handleEditorChange}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          renderLineHighlight: "line",
          scrollbar: { vertical: "auto", horizontal: "auto", verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          padding: { top: 12, bottom: 12 },
          readOnly: disabled,
          wordWrap: "on",
          tabSize: 4,
          automaticLayout: true,
          quickSuggestions: true,
          bracketPairColorization: { enabled: true },
        }}
        theme="vs-dark"
        loading={
          <div className="flex h-[320px] items-center justify-center text-xs text-zinc-500">
            Loading editor…
          </div>
        }
      />

      {/* Footer hint */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-t border-white/10 bg-[#252526]">
        <span className="text-[10px] text-zinc-500">
          <kbd className="rounded border border-white/15 px-1 font-mono text-[9px]">Tab</kbd> indent &bull;{" "}
          <kbd className="rounded border border-white/15 px-1 font-mono text-[9px]">Ctrl+Z</kbd> undo &bull;{" "}
          <kbd className="rounded border border-white/15 px-1 font-mono text-[9px]">Ctrl+/</kbd> comment
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Play className="h-3 w-3 text-emerald-500/60" />
          <span className="text-[10px] text-zinc-500">Code is bundled with your answer on submit</span>
        </div>
      </div>
    </div>
  )
}
