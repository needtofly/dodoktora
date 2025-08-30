import React from "react";

export function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
          checked ? "translate-x-6" : ""
        }`}
      />
    </button>
  );
}
