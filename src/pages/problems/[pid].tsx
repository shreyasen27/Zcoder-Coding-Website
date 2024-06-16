import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import useHasMounted from "@/hooks/useHasMounted";
import { fetchProblems } from "@/utils/problems";
import { DBProblem } from "@/utils/types/problem";
import React from "react";

type ProblemPageProps = {
    problem: DBProblem;
};

const ProblemPage: React.FC<ProblemPageProps> = ({ problem }) => {
    const hasMounted = useHasMounted();

    if (!hasMounted) return null;

    return (
        <div>
            <Topbar problemPage />
            <Workspace problem={problem} />
        </div>
    );
};
export default ProblemPage;

// getStaticPaths => it create the dynamic routes
export async function getStaticPaths() {
    const problems = await fetchProblems(); // Await the fetchProblems function to get the data
    const paths = Object.keys(problems).map((key) => ({
        params: { pid: key },
    }));

    return {
        paths,
        fallback: false,
    };
}

// getStaticProps => it fetch the data
export async function getStaticProps({ params }: { params: { pid: string } }) {
    const { pid } = params;
    const problems = await fetchProblems(); // Await the fetchProblems function to get the data
    const problem = problems[pid];

    if (!problem) {
        return {
            notFound: true,
        };
    }
    problem.handlerFunction = problem.handlerFunction.toString();
    return {
        props: {
            problem,
        },
    };
}