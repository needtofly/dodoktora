import React from "react";

export const Card = ({ children, className }: any) => (
  <div className={`bg-white shadow rounded p-4 ${className}`}>{children}</div>
);

export const CardHeader = ({ children }: any) => <div className="mb-2">{children}</div>;
export const CardTitle = ({ children }: any) => <h2 className="text-xl font-bold">{children}</h2>;
export const CardContent = ({ children }: any) => <div>{children}</div>;
