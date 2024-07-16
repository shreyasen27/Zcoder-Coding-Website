// pages/index.tsx

import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import Topbar from "@/components/Topbar/Topbar";
import useHasMounted from "@/hooks/useHasMounted";
import { auth } from "@/firebase/firebase";
import { useState, useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import AddProblems from "@/components/Buttons/AddProblems";
import { fetchPublicProblems, fetchPrivateProblems } from "@/utils/problems";
import { DBProblem } from "@/utils/types/problem";

export default function Home() {
    const [loadingProblems, setLoadingProblems] = useState(true);
    const [publicProblems, setPublicProblems] = useState<DBProblem[]>([]);
    const [privateProblems, setPrivateProblems] = useState<DBProblem[]>([]);
    const [totalProblems, setTotalProblems] = useState(0);
    const hasMounted = useHasMounted();
    const [user] = useAuthState(auth);

    useEffect(() => {
        const loadProblems = async () => {
            try {
                const fetchedPublicProblems = await fetchPublicProblems();
                if (user && hasMounted) {
                    console.log("Fetching problems for user:", user.uid);
                    
                    const fetchedPrivateProblems = await fetchPrivateProblems(user.uid);
                    setPublicProblems(fetchedPublicProblems);
                    setPrivateProblems(fetchedPrivateProblems);
                    setTotalProblems(fetchedPublicProblems.length + fetchedPrivateProblems.length);
                    setLoadingProblems(false);
                }
            } catch (error) {
                console.error("Error fetching problems:", error);
                setLoadingProblems(false);
            }
        };

        loadProblems();
    }, [user, hasMounted]);

    return (
        <>
            <main className='bg-dark-layer-2 min-h-screen'>
                <Topbar />
                <h1 className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium uppercase mt-10 mb-5'>
                    &ldquo; YOUR ULTIMATE CODING DESTINATION! &rdquo; 
                </h1>
                <div className='relative overflow-x-auto mx-auto px-6 pb-10'>
                    
                    <table className='text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full max-w-[1200px] mx-auto'>
                        
                            <thead className='text-xs text-gray-700 uppercase dark:text-gray-400 border-b'>
                                <tr>
                                    <th scope='col' className='px-1 py-3 w-0 font-medium'>Status</th>
                                    <th scope='col' className='px-6 py-3 w-0 font-medium'>Title</th>
                                    <th scope='col' className='px-6 py-3 w-0 font-medium'>Difficulty</th>
                                    <th scope='col' className='px-6 py-3 w-0 font-medium'>Category</th>
                                    <th scope='col' className='px-6 py-3 w-0 font-medium'>Solution</th>
                                </tr>
                            </thead>
                        
                        <ProblemsTable 
                            publicProblems={publicProblems}
                            privateProblems={privateProblems}
                        />
                    </table>
                </div>
                <div className="flex justify-center items-center w-full">
                    {user && <AddProblems />}
                </div>
            </main>
        </>
    );
}