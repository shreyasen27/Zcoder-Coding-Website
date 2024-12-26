import React from 'react';
const Footer:React.FC=()=>{
    return(
        <footer className="bg-gray-800 text-white py-4 text-center">
          <div className="container mx-auto">
            <p className="text-sm">
                &copy; {new Date().getFullYear()} ZCoder. All Rights Reserved.
            </p>
          </div>
          <div className="flex justify-start text-sm mx-2">
          <a href="/about" className="hover:underline">About</a>
          </div>
        </footer>
         
    );

};
export default Footer;