// components/Topbar/Topbar.tsx

import { auth, firestore } from "@/firebase/firebase";
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
import { fetchPublicProblems, fetchPrivateProblems } from "@/utils/problems"; // Updated import
import { DBProblem } from "@/utils/types/problem";
import {doc,getDoc} from "firebase/firestore";
import {BiSearch} from "react-icons/bi"
type TopbarProps = {
  problemPage?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage }) => {
  const [user, loading, error] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(authModalState);
  const router = useRouter();
  const [problems, setProblems] = useState<DBProblem[]>([]);
  const [avatar,setAvatar]=useState<string | null>(null);
  const [searchTerm,setSearchTerm]=useState("");
  useEffect(() => {
    const fetchAvatar=async () =>{
      if(user){
        try{
          const userDocRef=doc(firestore,"users",user.uid);
          const userDoc= await getDoc(userDocRef);
          if(userDoc.exists())
          {
            const userData=userDoc.data();
            const maleAvatar="/male_avatar.jpeg";
            const femaleAvatar="/female_avatar.jpeg";
            setAvatar(
              userData.avatar || (userData.gender ==="Male"?maleAvatar:femaleAvatar)
            );
          }
        } catch(error)
        {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchAvatar();
  
    if (!loading && !user) {
      console.error("User is not authenticated.");
      // Optionally handle the case where user is not authenticated
      // Redirect or show appropriate message
    }
  }, [user, loading]);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const fetchedPublicProblems = await fetchPublicProblems(); // Fetch public problems

        const currentUser = auth.currentUser;
        if (currentUser) {
          const userId = currentUser.uid;
          const fetchedPrivateProblems = await fetchPrivateProblems(userId); // Fetch private problems

          // Merge public and private problems into one object
          const allProblems = { ...fetchedPublicProblems, ...fetchedPrivateProblems };
          setProblems(allProblems);
        } else {
          console.error("User is not authenticated.");
        }
      } catch (error) {
        console.error("Error loading problems:", error);
      }
    };

    loadProblems();
  }, []);
  const handleSearch=()=>{
    if(searchTerm.trim())
    {
      router.push('/search?query=${encodeURIComponent(searchTerm.trim())}');
    }
  };
  const handleProblemChange = (isForward: boolean) => {
    const currentProblemId = Number(router.query.pid);
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
          <Image src='/zcoder-favicon.png' alt='Logo' height={100} width={80} />
        </Link>
          <div className="flex-grow items-center mx-auto ">
            <div className="flex relative max-w-lg ">
              <input type="text" className="w-full px-4 py-2 text-sm bg-white text-black rounded-lg"
              placeholder="Search users...."
              value={searchTerm}
              onChange={(e)=> setSearchTerm(e.target.value)}
              />
              <button onClick={handleSearch}
               className="flex place-items-end  px-4 py-2 bg-blue-950 text-white rounded-r-lg ">
                <BiSearch size={20}/>
               </button>
            </div>
          </div>
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
              <Image src={avatar || '/avatar.png' } alt='Avatar' width={30} height={30} className='rounded-full' />
              <div
                className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg 
                z-40 group-hover:scale-100 scale-0 
                transition-all duration-300 ease-in-out'
              >
                <p className="text-center">View Profile</p>
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