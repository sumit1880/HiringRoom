import { useQuery } from "@tanstack/react-query";

import { getResumes } from "../api/resume.api";

export function useResume() {
  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["resumes"],
    queryFn: getResumes,
  });

  return {
    resumes: data,
    isLoading,
    refetch,
  };
}