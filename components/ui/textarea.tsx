import React from "react";

export const Textarea = ({ className, ...props }: any) => (
  <textarea
    className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);
