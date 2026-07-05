import { ClipLoader } from "react-spinners";

export default function Spinner() {
  return (
    <div className="flex justify-center">
      <ClipLoader
        size={28}
        color="#2563EB"
      />
    </div>
  );
}