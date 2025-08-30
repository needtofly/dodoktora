import React from "react";

export const Label = ({ children, className }: any) => (
  <label className={`block mb-1 font-medium ${className}`}>{children}</label>
);
