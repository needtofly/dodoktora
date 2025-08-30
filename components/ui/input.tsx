import React from "react";

export const Input = ({ className, ...props }: any) => (
  <input
    className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);
