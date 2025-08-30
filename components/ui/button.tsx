import React from "react";

export const Button = ({ children, className, ...props }: any) => (
  <button
    className={`bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${className}`}
    {...props}
  >
    {children}
  </button>
);
