interface Props {
  technical: number;
  communication: number;
  confidence: number;
}

export default function ScorePanel({
  technical,
  communication,
  confidence,
}: Props) {
  const Row = (
    label: string,
    value: number
  ) => (
    <div className="mb-6">
      <div className="mb-2 flex justify-between">
        <span>{label}</span>

        <span>{value}/10</span>
      </div>

      <div className="h-3 rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${value * 10}%`,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="sticky top-6 rounded-3xl bg-slate-900 p-6">
      <h2 className="mb-8 text-xl font-bold">
        Evaluation
      </h2>

      {Row("Technical", technical)}

      {Row(
        "Communication",
        communication
      )}

      {Row(
        "Confidence",
        confidence
      )}
    </div>
  );
}