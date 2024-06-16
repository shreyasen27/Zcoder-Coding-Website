import React, { useEffect, useState } from "react";
import { firestore } from "@/firebase/firebase";
import AddSolutionForm from "./AddSolutionForm";
import { doc, getDoc } from "firebase/firestore";

const UserProfile = () => {
    const [userSolvedProblems, setUserSolvedProblems] = useState<{ id: string, title: string, problemStatement: string, solution: string }[]>([]);
    const [showAddSolutionForm, setShowAddSolutionForm] = useState(false);

    useEffect(() => {
        const fetchUserSolvedProblems = async () => {
            try {
                const userId = "HpT6ikMcZdMONAJAcKmH6KFPiLG3"; // Example user ID
                const userDocRef = doc(firestore, "users", userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData) {
                        const solvedProblems = userData.solvedProblems || [];

                        const problemDocs = await Promise.all(
                            solvedProblems.map(async (problemId: string) => {
                                const problemDocRef = doc(firestore, "problems", problemId);
                                const problemDoc = await getDoc(problemDocRef);

                                if (problemDoc.exists()) {
                                    return { id: problemDoc.id, ...problemDoc.data() } as { id: string, title: string, problemStatement: string, solution: string };
                                } else {
                                    console.error(`Problem document with ID ${problemId} does not exist.`);
                                    return null;
                                }
                            })
                        );

                        setUserSolvedProblems(problemDocs.filter(problem => problem !== null) as { id: string, title: string, problemStatement: string, solution: string }[]);
                    } else {
                        console.error("User data is undefined");
                    }
                } else {
                    console.log("User document does not exist");
                }
            } catch (error) {
                console.error("Error fetching user solved problems: ", error);
            }
        };

        fetchUserSolvedProblems();
    }, []);

    const toggleAddSolutionForm = () => {
        setShowAddSolutionForm(!showAddSolutionForm);
    };

    return (
        <div>
            <h1>User Profile</h1>
            <h2>Solved Problems</h2>
            <ul>
                {userSolvedProblems.map((problem) => (
                    <li key={problem.id}>
                        <h3>{problem.title}</h3>
                        <p>{problem.problemStatement}</p>
                        {/* Render solution here */}
                        <pre>{problem.solution}</pre>
                    </li>
                ))}
            </ul>
            <div className="text-center mt-6">
                <button
                    onClick={toggleAddSolutionForm}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                    {showAddSolutionForm ? "Hide Add Problem Form" : "Show Add Problem Form"}
                </button>
            </div>
            {showAddSolutionForm && <AddSolutionForm />}
        </div>
    );
};

export default UserProfile;
