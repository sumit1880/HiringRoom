import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import Button from "../ui/Button";
import { useUploadResume } from "../../mutations/useUploadResume";

export default function ResumeUploader() {
  const uploadMutation = useUploadResume();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, acceptedFiles, isDragActive } =
    useDropzone({
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      onDrop,
    });

  const file = acceptedFiles[0];

  return (
    <motion.div
      layout
      className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl"
    >
      {/* DROPZONE */}
      <div {...getRootProps()}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          animate={{
            borderColor: isDragActive ? "#3B82F6" : "#334155",
          }}
          className="cursor-pointer rounded-3xl border-2 border-dashed py-16 text-center transition-all"
        >
          <input {...getInputProps()} />

          {file ? (
            <div>
              <FileText size={60} className="mx-auto text-blue-500" />
              <h2 className="mt-4 text-lg font-semibold text-white">
                {file.name}
              </h2>
              <p className="mt-2 text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <UploadCloud size={70} className="mx-auto text-blue-500" />
              <h2 className="mt-6 text-2xl font-bold text-white">
                Drag & Drop Resume
              </h2>
              <p className="mt-3 text-slate-400">
                or click to browse your PDF
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* UPLOAD BUTTON */}
      <div className="mt-8">
        <Button
          loading={uploadMutation.isPending}
          disabled={!file || uploadMutation.isPending}
          onClick={() => {
            if (file) {
              uploadMutation.mutate(file);
            }
          }}
        >
          Upload Resume
        </Button>
      </div>

      {/* SUCCESS STATE */}
      {uploadMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-400"
        >
          <CheckCircle2 size={22} />
          Resume uploaded successfully.
        </motion.div>
      )}
    </motion.div>
  );
}