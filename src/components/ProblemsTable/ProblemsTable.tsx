// components/ProblemsTable/ProblemsTable.tsx

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { AiFillYoutube } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import YouTube from "react-youtube";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { DBProblem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";

type ProblemsTableProps = {
  publicProblems: DBProblem[];
  privateProblems: DBProblem[];
};

const ProblemsTable: React.FC<ProblemsTableProps> = ({
  publicProblems = [],
  privateProblems = [],
}) => {
  const [youtubePlayer, setYoutubePlayer] = useState<{
    isOpen: boolean;
    videoId: string | null;
  }>({
    isOpen: false,
    videoId: null,
  });
  const [selectedProblems, setSelectedProblems] = useState<DBProblem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) {
      setSelectedProblems(publicProblems);
    } else {
      setSelectedProblems([...publicProblems, ...privateProblems]);
    }
  }, [user, publicProblems, privateProblems]);

  useEffect(() => {
    if (!user) return;

    const getSolvedProblems = async () => {
      const userRef = doc(firestore, `users/${user.uid}`);
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const solvedProblemsArray = userData?.solvedProblems || [];
          setSolvedProblems(solvedProblemsArray);
        }
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    getSolvedProblems();
  }, [user]);

  const closeModal = () => {
    setYoutubePlayer({ isOpen: false, videoId: null });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {error && (
        <div className="text-red-600 bg-red-200 p-4 mb-4 rounded">
          Error: {error}
        </div>
      )}
      <tbody className="text-white">
        {selectedProblems.map((problem, idx) => {
          const difficultyColor =
            problem.difficulty === "easy"
              ? "text-dark-green-s"
              : problem.difficulty === "medium"
              ? "text-dark-yellow"
              : "text-dark-pink";
          //const isSolved = solvedProblems.includes(problem.id);
          return (
            <tr
              className={`${idx % 2 === 1 ? "bg-dark-layer-1" : ""}`}
              key={problem.id}
            >
              <th className="px-2 py-4 font-medium whitespace-nowrap text-dark-green-s">
                <BsCheckCircle fontSize={"18"} width="18" />
              </th>
              <td className="px-6 py-4">
                <Link
                  href={{
                    pathname: '/problems2/problempage2',
                    query: { problem: JSON.stringify(problem) },
                  }}
                  legacyBehavior
                >
                  <div className="hover:text-blue-600 cursor-pointer">
                    {idx + 1}. {problem.title}
                  </div>
                </Link>
              </td>
              <td className={`px-6 py-4 ${difficultyColor}`}>
                {problem.difficulty}
              </td>
              <td className={"px-6 py-4"}>{problem.category}</td>
              <td className={"px-6 py-4"}>
                {problem.videoId && problem.videoId.trim() ? (
                  <AiFillYoutube
                    fontSize={"28"}
                    className="cursor-pointer hover:text-red-600"
                    onClick={() =>
                      setYoutubePlayer({
                        isOpen: true,
                        videoId: problem.videoId!,
                      })
                    }
                  />
                ) : (
                  <p className="text-gray-400">Coming soon</p>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
      {youtubePlayer.isOpen && youtubePlayer.videoId && (
        <tfoot className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center">
          <div
            className="bg-black z-10 opacity-70 top-0 left-0 w-screen h-screen absolute"
            onClick={closeModal}
          ></div>
          <div className="w-full z-50 h-full px-6 relative max-w-4xl">
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="w-full relative">
                <IoClose
                  fontSize={"35"}
                  className="cursor-pointer absolute -top-16 right-0"
                  onClick={closeModal}
                />
                <YouTube
                  videoId={youtubePlayer.videoId}
                  loading="lazy"
                  iframeClassName="w-full min-h-[500px]"
                />
              </div>
            </div>
          </div>
        </tfoot>
      )}
    </>
  );
};

export default ProblemsTable;