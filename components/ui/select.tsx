import React from "react";

export const Select = ({ children, value, onValueChange }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {children}
  </select>
);

export const SelectTrigger = ({ children, className }: any) => <div className={className}>{children}</div>;
export const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;
