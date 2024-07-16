import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import { DBProblem } from "@/utils/types/problem";
import { fetchPublicProblems, fetchPrivateProblems } from "@/utils/problems";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useRouter } from "next/router";

const ProblemPage: React.FC = () => {
    const router = useRouter();
    const { pid } = router.query;
  
    const [problem, setProblem] = useState<DBProblem | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchProblem = async () => {
        // Ensure pid is a string
        if (!pid || Array.isArray(pid) || isNaN(Number(pid))) return;
        const problemId = Number(pid);
  
        let fetchedProblem: DBProblem | null = null;
        try {
          const publicProblems = await fetchPublicProblems();
          fetchedProblem = publicProblems[problemId] || null;
  
          if (!fetchedProblem) {
            const user = auth.currentUser;
            if (user) {
              const privateProblems = await fetchPrivateProblems(user.uid);
              fetchedProblem = privateProblems[problemId] || null;
            }
          }
        } catch (error) {
          console.error("Error fetching problem:", error);
        }
  
        setProblem(fetchedProblem);
        setLoading(false);
      };
  
      fetchProblem();
    }, [pid]);
  
    if (loading) return <div>Loading...</div>;
    if (!problem) return <div>Problem not found</div>;
  
    return (
      <div>
        <Topbar problemPage />
        <Workspace problem={problem} />
      </div>
    );
  };
  
  export default ProblemPage;