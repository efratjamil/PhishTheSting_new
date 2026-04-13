import React from "react";
import { Link } from "react-router-dom";

export default function CustomButton({
  to,
  children,
  onClick,
  type = "button",
}) {
  const baseClass = `
    relative overflow-hidden h-12 px-8 rounded-full
    bg-[#449ba2] bg-[length:400%] text-white font-semibold
    flex items-center justify-center
    transition-transform duration-200 ease-in-out
    hover:scale-105
    before:content-[''] before:absolute before:top-0 before:left-0
    before:w-full before:h-full before:rounded-full
    before:bg-gradient-to-r before:from-[#449ba2] before:to-[#337e84]
    before:origin-left before:scale-x-0 before:transition-transform before:duration-[475ms]
    hover:before:scale-x-100
  `;

  const contentClass = `relative z-10`;

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        <span className={contentClass}>{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClass}>
      <span className={contentClass}>{children}</span>
    </button>
  );
}
