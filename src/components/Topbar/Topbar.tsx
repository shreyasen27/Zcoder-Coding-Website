// components/Topbar/Topbar.tsx

import { auth } from "@/firebase/firebase";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Logout from "../Buttons/Logout";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import Timer from "../Timer/Timer";
import { useRouter } from "next/router";
import { fetchProblems } from "@/utils/problems"; // Assuming fetchProblems is a function that fetches problems from the database
import { DBProblem } from "@/utils/types/problem";

type TopbarProps = {
  problemPage?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage }) => {
  const [user, loading, error] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(authModalState);
  const router = useRouter();
  const [problems, setProblems] = useState<{ [key: string]: DBProblem }>({});

  useEffect(() => {
    if (!loading && !user) {
      console.error("User is not authenticated.");
      // Optionally handle the case where user is not authenticated
      // Redirect or show appropriate message
    }
  }, [user, loading]);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userId = currentUser.uid;
          const fetchedProblems = await fetchProblems(); // Assume fetchProblems fetches and returns the problems
          setProblems(fetchedProblems);
        } else {
          console.error("User is not authenticated.");
        }
      } catch (error) {
        console.error("Error loading problems:", error);
      }
    };
    loadProblems();
  }, []);

  const handleProblemChange = (isForward: boolean) => {
    const currentProblemId = router.query.pid as string;
    const currentProblem = problems[currentProblemId];

    if (!currentProblem) {
      return;
    }

    const currentOrder = currentProblem.order;
    const problemsArray = Object.values(problems);
    const totalProblems = problemsArray.length;

    let nextProblemOrder = isForward ? currentOrder + 1 : currentOrder - 1;

    if (nextProblemOrder > totalProblems) {
      nextProblemOrder = 1;
    } else if (nextProblemOrder < 1) {
      nextProblemOrder = totalProblems;
    }

    const nextProblem = problemsArray.find((problem) => problem.order === nextProblemOrder);

    if (nextProblem) {
      router.push(`/problems/${nextProblem.id}`);
    }
  };

  return (
    <nav className='relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7'>
      <div className={`flex w-full items-center justify-between ${!problemPage ? "max-w-[1200px] mx-auto" : ""}`}>
        <Link href='/' className='h-[22px] flex-1'>
          <Image src='/zcoder-logo.png' alt='Logo' height={100} width={80} />
        </Link>

        {problemPage && (
          <div className='flex items-center gap-4 flex-1 justify-center'>
            <div
              className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
              onClick={() => handleProblemChange(false)}
            >
              <FaChevronLeft />
            </div>
            <Link
              href='/'
              className='flex items-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer'
            >
              <div>
                <BsList />
              </div>
              <p>Problem List</p>
            </Link>
            <div
              className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
              onClick={() => handleProblemChange(true)}
            >
              <FaChevronRight />
            </div>
          </div>
        )}

        <div className='flex items-center space-x-4 flex-1 justify-end'>
          
          {!user && (
            <Link
              href='/auth'
              onClick={() => setAuthModalState((prev) => ({ ...prev, isOpen: true, type: "login" }))}
            >
              <button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded '>Sign In</button>
            </Link>
          )}
          {user && problemPage && <Timer />}
          {user && (
            <div className='cursor-pointer group relative'>
              <Image src='/avatar.png' alt='Avatar' width={30} height={30} className='rounded-full' />
              <div
                className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg 
                z-40 group-hover:scale-100 scale-0 
                transition-all duration-300 ease-in-out'
              >
                <p className='text-sm'>{user.email}</p>
              </div>
            </div>
          )}
          {user && <Logout />}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;