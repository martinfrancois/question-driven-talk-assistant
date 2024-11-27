import React, { forwardRef, useId } from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  disabled?: boolean;
  className?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { checked = false, disabled = false, className = "", onChange, ...rest },
    ref,
  ) => {
    const reactId = useId();
    const checkboxId = rest.id ?? reactId;

    const rootClasses = `inline-flex items-center space-x-2 bg-transparent rounded-md ${
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
    } ${className}`;

    const iconContainerClasses = `h-5 w-5 flex items-center justify-center rounded-md border transition-colors bg-clip-padding ${
      checked
        ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
        : "bg-white border-gray-400 dark:bg-gray-700 dark:border-gray-600"
    } ${
      disabled
        ? "bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-700"
        : ""
    }`;

    return (
      <label htmlFor={checkboxId} className={rootClasses}>
        <div className="relative">
          <input
            {...rest}
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className={`absolute h-full w-full cursor-pointer opacity-0`}
          />
          <span className={iconContainerClasses} aria-hidden="true">
            {checked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        </div>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
