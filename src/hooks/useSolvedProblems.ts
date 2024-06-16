import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firestore, auth } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const useSolvedProblems = () => {
    const [user] = useAuthState(auth);
    const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
    
    useEffect(() => {
        const fetchSolvedProblems = async () => {
            if (user) {
                const userRef = doc(firestore, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    setSolvedProblems(userDoc.data().solvedProblems || []);
                }
            }
        };
        
        fetchSolvedProblems();
    }, [user]);

    return solvedProblems;
};

export default useSolvedProblems;
