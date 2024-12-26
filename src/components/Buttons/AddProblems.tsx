import React from 'react';
import { useRouter } from 'next/router';

type AddProblemsProps = {};

const AddProblems: React.FC<AddProblemsProps> = () => {
    const router = useRouter();

    const handleSubmit = () => {
        router.push('/userProfile/AddSolutionForm');  
    };

    return (
        <div className="flex justify-center items-center w-full overflow-hidden">
            <button 
                onClick={handleSubmit}
                className="bg-orange-500 text-white py-2 px-4 rounded mb-4"
                style={{ width: '500px' }}
            >
                Add Problems
            </button>
        </div>
    );
};

export default AddProblems;