import { DBProblem } from "../types/problem";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function fetchPublicProblems(): Promise<DBProblem[]> {
    const problemsCollection = collection(firestore, "problems");

    // Create a query to fetch only public problems
    const publicProblemsQuery = query(problemsCollection, where("isPrivate", "==", false));

    // Execute the query
    const publicSnapshot = await getDocs(publicProblemsQuery);

    const publicProblems: DBProblem[] = [];

    publicSnapshot.forEach((doc) => {
        publicProblems.push(doc.data() as DBProblem);
    });

    return publicProblems;
}

export async function fetchPrivateProblems(userId: string): Promise<DBProblem[]> {
    const problemsCollection = collection(firestore, "problems");

    // Fetch all problems (this fetches all documents in the collection)
    const querySnapshot = await getDocs(problemsCollection);

    const privateProblems: DBProblem[] = [];

    // Iterate through each document to filter private problems created by userId
    querySnapshot.forEach((doc) => {
        const data = doc.data() as DBProblem;
        if (data.isPrivate && data.creatorId === userId) {
            privateProblems.push(data);
        }
    });

    return privateProblems;
}