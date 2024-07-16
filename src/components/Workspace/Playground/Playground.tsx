import { useState, useEffect } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import EditorFooter from "./EditorFooter";
import { Problem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type PlaygroundProps = {
  problem: Problem;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface ISettings {
  fontSize: string;
  settingsModalIsOpen: boolean;
  dropdownIsOpen: boolean;
}

const Playground: React.FC<PlaygroundProps> = ({ problem, setSuccess, setSolved }) => {
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
  const [userCode, setUserCode] = useState<string>(problem?.starterCode);

  const [settings, setSettings] = useState<ISettings>({
    fontSize: "16px",
    settingsModalIsOpen: false,
    dropdownIsOpen: false,
  });

  const [user] = useAuthState(auth);
  const {
    query: { pid },
  } = useRouter();

  useEffect(() => {
    const fetchUserCode = async () => {
      if (!user) return;

      try {
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const solutionProblemMap = userData?.solutionProblemMap || [];

          // Find the index of the problem in solutionProblemMap
          const index = solutionProblemMap.findIndex((item: any) => item.pid === pid);

          if (index !== -1) {
            // Update the user code if the problem exists
            setUserCode(solutionProblemMap[index].code);
          } else {
            // Use the starter code if no solution is found
            setUserCode(problem.starterCode);
          }
        }
      } catch (error) {
        console.error("Error fetching user's document:", error);
      }
    };

    fetchUserCode();
  }, [user, pid, problem?.starterCode]);

  const onChange = (value: string) => {
    setUserCode(value);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to submit your code", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    try {
      // Fetch the current user document
      const userRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userRef);
      let solutionProblemMap = [];

      if (userDoc.exists()) {
        const userData = userDoc.data();
        solutionProblemMap = userData?.solutionProblemMap || [];
      }

      // Update or add the problem solution
      const updatedSolutionProblemMap = solutionProblemMap.filter((item: any) => item.pid !== pid);
      updatedSolutionProblemMap.push({ pid, code: userCode });

      // Update user's solutionProblemMap in Firestore
      await updateDoc(userRef, {
        solutionProblemMap: updatedSolutionProblemMap,
      });

      toast.success("Problem solution saved successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
      setSolved(true);
    } catch (error: any) {
      console.error("Error updating user's code:", error);
      toast.error("Failed to save problem solution. Please try again later.", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  return (
    <div className='flex flex-col bg-dark-layer-1 relative overflow-x-hidden'>
      <PreferenceNav settings={settings} setSettings={setSettings} />

      <Split className='h-[calc(100vh-94px)]' direction='vertical' sizes={[60, 40]} minSize={60}>
        <div className='w-full overflow-auto'>
          <CodeMirror
            value={userCode}
            theme={vscodeDark}
            onChange={onChange}
            extensions={[javascript()]}
            style={{ fontSize: settings.fontSize }}
          />
        </div>
        <div className='w-full px-5 overflow-auto'>
          {/* testcase heading */}
          <div className='flex h-10 items-center space-x-6'>
            <div className='relative flex h-full flex-col justify-center cursor-pointer'>
              <div className='text-sm font-medium leading-5 text-white'>Testcases</div>
              <hr className='absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white' />
            </div>
          </div>

          <div className='flex'>
            {problem?.examples.map((example, index) => (
              <div
                className='mr-2 items-start mt-2 '
                key={example.id}
                onClick={() => setActiveTestCaseId(index)}
              >
                <div className='flex flex-wrap items-center gap-y-4'>
                  <div
                    className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap
                    ${activeTestCaseId === index ? "text-white" : "text-gray-500"}
                  `}
                  >
                    Case {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='font-semibold my-4'>
            <p className='text-sm font-medium mt-4 text-white'>Input:</p>
            <div className='w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2'>
              {problem?.examples[activeTestCaseId].inputText}
            </div>
            <p className='text-sm font-medium mt-4 text-white'>Output:</p>
            <div className='w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2'>
              {problem?.examples[activeTestCaseId].outputText}
            </div>
          </div>
        </div>
      </Split>
      <EditorFooter handleSubmit={handleSubmit} />
    </div>
  );
};

export default Playground;