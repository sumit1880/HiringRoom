import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/user.api";
import { getResumes } from "../api/resume.api";
import { getInterviews } from "../api/interview.api";

export function useDashboard() {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const resumeQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: getResumes,
  });

  const interviewQuery = useQuery({
    queryKey: ["interviews"],
    queryFn: getInterviews,
  });

  return {
    user: userQuery.data,
    resumes: resumeQuery.data ?? [],
    interviews: interviewQuery.data ?? [],
    isLoading:
      userQuery.isLoading ||
      resumeQuery.isLoading ||
      interviewQuery.isLoading,
  };
}