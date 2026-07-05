import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import Button from "../ui/Button";

import { useCreateInterview } from "../../mutations/useCreateInterview";

import { useNavigate } from "react-router-dom";

export default function CreateInterviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const mutation = useCreateInterview();

  const [title, setTitle] =
    useState("");

  const [type, setType] =
    useState("TECHNICAL");

  if (!open) return null;

  async function create() {
    const session =
      await mutation.mutateAsync({
        title,
        type: type as any,
      });

    onClose();

    navigate(`/interview/${session.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-8"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            New Interview
          </h2>

          <button onClick={onClose}>
            <X className="text-slate-400" />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Interview title"
          className="mb-5 w-full rounded-xl bg-slate-800 p-3 text-white"
        />

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
          className="mb-8 w-full rounded-xl bg-slate-800 p-3 text-white"
        >
          <option value="TECHNICAL">
            Technical
          </option>

          <option value="HR">
            HR
          </option>

          <option value="DSA">
            DSA
          </option>

          <option value="SYSTEM_DESIGN">
            System Design
          </option>
        </select>

        <Button
          loading={mutation.isPending}
          onClick={create}
        >
          Create Interview
        </Button>
      </motion.div>
    </div>
  );
}

