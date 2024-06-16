import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore, auth } from '@/firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const useProblemStatementsAndSolutions = (solvedProblems: string[]) => {
    const [problemsAndSolutions, setProblemsAndSolutions] = useState<any[]>([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        const fetchProblemsAndSolutions = async () => {
            if (solvedProblems.length > 0) {
                const problemsRef = collection(firestore, 'problems');
                const q = query(problemsRef, where('id', 'in', solvedProblems));
                const problemDocs = await getDocs(q);

                const solutionsRef = collection(firestore, 'solutions');
                const solutionsQ = query(solutionsRef, where('pid', 'in', solvedProblems), where('uid', '==', user?.uid));
                const solutionDocs = await getDocs(solutionsQ);

                const problems = problemDocs.docs.map(doc => doc.data());
                const solutions = solutionDocs.docs.map(doc => doc.data());

                const combinedData = problems.map(problem => ({
                    ...problem,
                    solution: solutions.find(solution => solution.pid === problem.id)?.code || 'No solution found'
                }));

                setProblemsAndSolutions(combinedData);
            }
        };

        fetchProblemsAndSolutions();
    }, [solvedProblems, user]);

    return problemsAndSolutions;
};

export default useProblemStatementsAndSolutions;
