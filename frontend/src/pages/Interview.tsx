import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  useAnswerInterview,
  useStartInterview,
} from "../hooks/useInterview";

import ChatBubble from "../components/interview/ChatBubble";
import ScorePanel from "../components/interview/ScorePanel";
import TypingIndicator from "../components/interview/TypingIndicator";

type Message = {
  role: "ai" | "user";
  text: string;
};

type Evaluation = {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
};

export default function Interview() {
  const navigate = useNavigate();

  const { id } = useParams();

  if (!id) {
    return (
      <DashboardLayout>
        Invalid Interview
      </DashboardLayout>
    );
  }

  const sessionId = id;

  const startMutation = useStartInterview();

  const answerMutation = useAnswerInterview();

  const [answer, setAnswer] = useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [typing, setTyping] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [scores, setScores] =
    useState({
      technical: 0,
      communication: 0,
      confidence: 0,
    });

  const [
    evaluation,
    setEvaluation,
  ] = useState<Evaluation | null>(null);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  async function startInterview() {
    const data =
      await startMutation.mutateAsync(
        sessionId
      );

    setMessages([
      {
        role: "ai",
        text: data.question,
      },
    ]);
  }

  async function sendAnswer() {
    if (!answer.trim()) return;

    const current = answer;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: current,
      },
    ]);

    setAnswer("");

    setTyping(true);

    try {
      const result =
        await answerMutation.mutateAsync({
          sessionId,
          answer: current,
        });

      setTyping(false);

      setScores({
        technical:
          result.evaluation
            .technicalScore,

        communication:
          result.evaluation
            .communicationScore,

        confidence:
          result.evaluation
            .confidenceScore,
      });

      setEvaluation(
        result.evaluation
      );

      if (
        result.nextQuestion &&
        result.nextQuestion.question
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text:
              result.nextQuestion
                .question,
          },
        ]);
      } else {
        setCompleted(true);
      }
    } catch {
      setTyping(false);
    }
  }
    if (completed) {
    const overallScore = Math.round(
      (scores.technical +
        scores.communication +
        scores.confidence) /
        3
    );

    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-5xl space-y-8"
        >
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
            <h1 className="text-center text-5xl font-bold text-white">
              🎉 Interview Complete
            </h1>

            <p className="mt-3 text-center text-slate-400">
              Great job completing your AI interview.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-800 p-6 text-center">
                <p className="text-slate-400">
                  Overall
                </p>

                <h2 className="mt-3 text-5xl font-bold text-blue-400">
                  {overallScore}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  /10
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-6">
                <p className="text-slate-400">
                  Technical
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {scores.technical}
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-800 p-6">
                <p className="text-slate-400">
                  Communication
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {scores.communication}
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-800 p-6">
                <p className="text-slate-400">
                  Confidence
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {scores.confidence}
                </h2>
              </div>
            </div>

            {evaluation && (
              <>
                <div className="mt-10 rounded-2xl bg-slate-800 p-6">
                  <h2 className="mb-4 text-2xl font-bold text-white">
                    AI Feedback
                  </h2>

                  <p className="leading-8 text-slate-300">
                    {evaluation.feedback}
                  </p>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
                    <h2 className="mb-5 text-2xl font-bold text-green-400">
                      Strengths
                    </h2>

                    <ul className="space-y-3">
                      {evaluation.strengths.map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-slate-200"
                          >
                            ✅ {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                    <h2 className="mb-5 text-2xl font-bold text-red-400">
                      Areas to Improve
                    </h2>

                    <ul className="space-y-3">
                      {evaluation.weaknesses.map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-slate-200"
                          >
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </>
            )}

            <div className="mt-12 flex justify-center">
              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-3xl bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">
                AI Interview
              </h1>

              {messages.length === 0 && (
                <button
                  onClick={startInterview}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
                >
                  Start Interview
                </button>
              )}
            </div>

            <div className="h-[550px] space-y-6 overflow-y-auto">
              {messages.map(
                (message, index) => (
                  <ChatBubble
                    key={index}
                    role={message.role}
                    text={message.text}
                  />
                )
              )}

              {typing && (
                <TypingIndicator />
              )}

              <div ref={bottomRef} />
            </div>

            {messages.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <input
                  value={answer}
                  onChange={(e) =>
                    setAnswer(e.target.value)
                  }
                  placeholder="Type your answer..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:border-blue-500"
                />

                <button
                  onClick={sendAnswer}
                  disabled={
                    answerMutation.isPending
                  }
                  className="rounded-xl bg-blue-600 px-8 py-4 text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  Send
                </button>

                <button
                  onClick={() =>
                    setCompleted(true)
                  }
                  className="rounded-xl bg-red-600 px-8 py-4 text-white transition hover:bg-red-700"
                >
                  Finish
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <ScorePanel
            technical={scores.technical}
            communication={
              scores.communication
            }
            confidence={
              scores.confidence
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}