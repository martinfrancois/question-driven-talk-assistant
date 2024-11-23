import { FC } from "react";
import FocusLock, { ReactFocusLockProps } from "react-focus-lock";

export const SelectableTextFocusLock: FC<ReactFocusLockProps> = ({
  lockProps,
  children,
  ...rest
}) => {
  return (
    <FocusLock
      returnFocus
      lockProps={{
        tabIndex: -1, // Ensure text is selectable
        ...lockProps,
      }}
      {...rest}
    >
      {children}
    </FocusLock>
  );
};
