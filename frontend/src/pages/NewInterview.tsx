import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import { createInterview } from "../api/interview.api";

export default function NewInterview() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");

  const [type, setType] = useState<
    "DSA"  | "SYSTEM_DESIGN"
  >("DSA");

  const [loading, setLoading] =
    useState(false);

  async function handleCreate() {
    if (!title.trim()) return;

    try {
      setLoading(true);

      const interview =
        await createInterview({
          title,
          type,
        });

      navigate(
        `/interview/${interview.id}`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to create interview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 backdrop-blur-xl">
          <h1 className="text-4xl font-bold text-white">
            New Interview
          </h1>

          <p className="mt-3 text-slate-400">
            Create an AI interview session.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-white">
                Interview Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Frontend Developer Interview"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-white">
                Interview Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target
                      .value as typeof type
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:border-blue-500"
              >
                <option value="TECHNICAL">
                  Technical
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="MIXED">
                  Mixed
                </option>
              </select>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? "Creating..."
                : "Create Interview"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}