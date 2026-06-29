import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated";
};

function Card({ children, className = "", variant = "default" }: CardProps) {
  const baseStyles = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-800/50";
  const elevatedStyles = "shadow-md dark:shadow-gray-800/70";

  return (
    <div
      className={`${baseStyles} ${variant === "elevated" ? elevatedStyles : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;