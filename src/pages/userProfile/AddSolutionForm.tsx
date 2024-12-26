import React, { useState,useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { doc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore,auth } from '@/firebase/firebase';


type Example = {
  id: string;
  inputText: string;
  outputText: string;
  explanation: string;
  img: string; // Assuming img is a URL or path
};

const AddSolutionForm: React.FC = () => {
  const router = useRouter();
  const [inputs, setInputs] = useState({
    id: "",
    title: "",
    problemStatement: "",
    category: "",
    difficulty: "",
    videoId: "",
    link: "",
    constraints: "",
    isPrivate: true,
    order: 0,
    examples: Array<Example>(3).fill({
      id: "",
      inputText: "",
      outputText: "",
      explanation: "",
      img: "",
    }),
    handlerFunction: "",
    likes: 0,
    dislikes: 0,
    creatorId:"",
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setInputs((prevInputs) => ({
        ...prevInputs,
        creatorId: userId,
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    if (type === 'radio') {
      setInputs({
        ...inputs,
        [name]: value === 'true', // Convert 'true'/'false' string values to boolean
      });
    } else {
      setInputs({
        ...inputs,
        [name]: value,
      });
    }
  };
  const handleExampleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    const updatedExamples = [...inputs.examples];
    updatedExamples[index] = {
      ...updatedExamples[index],
      [name]: value,
    };
    setInputs({
      ...inputs,
      examples: updatedExamples,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.title || !inputs.problemStatement || !inputs.id) {
      toast.error("ID, Title, and Description are required", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    try {
      // Fetch the highest current order value from Firestore
      const q = query(collection(firestore, "problems"), orderBy("order", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      let highestOrder = 0;
      querySnapshot.forEach((doc) => {
        highestOrder = doc.data().order;
      });

      // Set the new problem's order value
      const newProblem = {
        ...inputs,
        order: highestOrder + 1,
        creatorId:auth.currentUser?.uid,
      };

      await setDoc(doc(firestore, "problems", inputs.id), newProblem);
      toast.success("Problem added successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      router.push('/');
    } catch (error) {
      toast.error("Failed to add problem. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="h-full w-full bg-white p-0 m-0">
      <form 
        onSubmit={handleSubmit}
        className="bg-blue-950 rounded shadow-md w-screen h-full  p-6"
      
      >
        <h2 className="text-2xl mb-4 text-white col-span-full text-center">Add New Problem</h2>
        <div className="mb-4 col-span-full">
          <label className="block text-white">Problem ID</label>
          <input
            type="text"
            name="id"
            value={inputs.id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4 col-span-full">
          <label className="block text-white">Title</label>
          <input
            type="text"
            name="title"
            value={inputs.title}
            onChange={handleInputChange}
            className="w-1/2 px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4 col-span-full">
          <label className="block text-white">Description</label>
          <textarea
            name="problemStatement"
            value={inputs.problemStatement}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            rows={8}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Category</label>
          <input
            type="text"
            name="category"
            value={inputs.category}
            onChange={handleInputChange}
            className="w-1/3 px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Difficulty</label>
          <select
            name="difficulty"
            value={inputs.difficulty}
            onChange={handleInputChange}
            className="w-1/4 px-3 py-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
       
        <div className="mb-4">
          <label className="block text-white">Video ID</label>
          <input
            type="text"
            name="videoId"
            value={inputs.videoId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Link</label>
          <input
            type="text"
            name="link"
            value={inputs.link}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Constraints</label>
          <textarea
            name="constraints"
            value={inputs.constraints}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Handler Function</label>
          <textarea
            name="handlerFunction"
            value={inputs.handlerFunction}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
         {/* Privacy Setting */}
         <div className="mb-4 col-span-full">
          <label className="block text-white">Privacy Setting</label>
          <div className="flex gap-4">
            <label className="text-white">
              <input
                type="radio"
                name="isPrivate"
                value="true"
                checked={inputs.isPrivate === true}
                onChange={handleInputChange}
              />
              Private
            </label>
            <label className="text-white">
              <input
                type="radio"
                name="isPrivate"
                value="false"
                checked={inputs.isPrivate === false}
                onChange={handleInputChange}
              />
              Public
            </label>
          </div>
        </div>
        {/* Creator ID - Readonly */}
        <div className="mb-4 col-span-full">
          <label className="block text-white">Creator ID</label>
          <input
            type="text"
            name="creatorId"
            value={inputs.creatorId}
            readOnly
            className="w-full px-3 py-2 border rounded bg-gray-200"
          />
        </div>
        {/* Examples */}
        {inputs.examples.map((example, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg text-white mb-2">Example {index + 1}</h3>
            <div className="mb-4">
              <label className="block text-white">ID</label>
              <input
                type="text"
                name="id"
                value={example.id}
                onChange={(e) => handleExampleChange(e, index)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Input Text</label>
              <textarea
                name="inputText"
                value={example.inputText}
                onChange={(e) => handleExampleChange(e, index)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Output Text</label>
              <textarea
                name="outputText"
                value={example.outputText}
                onChange={(e) => handleExampleChange(e, index)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>   
            <div className="mb-4">
              <label className="block text-white">Explanation</label>
              <textarea
                name="explanation"
                value={example.explanation}
                onChange={(e) => handleExampleChange(e, index)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Image URL</label>
              <input
                type="text"
                name="img"
                value={example.img}
                onChange={(e) => handleExampleChange(e, index)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddSolutionForm;
