import { DBProblem } from "../types/problem";
import { firestore } from "@/firebase/firebase"; // Assuming your firebase setup is correct
import { collection, getDocs } from "firebase/firestore";

export async function fetchProblems(): Promise<{ [key: string]: DBProblem }> {
    const problemsCollection = collection(firestore, "problems");
    const problemSnapshot = await getDocs(problemsCollection);
    const problemMap: { [key: string]: DBProblem } = {};

    problemSnapshot.forEach((doc) => {
        problemMap[doc.id] = doc.data() as DBProblem;
    });

    return problemMap;
}