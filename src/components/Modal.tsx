import { FC, useRef, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { SelectableTextFocusLock } from "./SelectableTextFocusLock.tsx";
import { useDarkModeClassName } from "./dark-mode-classnames.ts";

interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const Modal: FC<ModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isOpen,
}) => {
  const darkModeClassName = useDarkModeClassName();

  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      handler={onCancel}
      size="md"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className={`${darkModeClassName} text-gray-950 max-w-md border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50`}
    >
      {isOpen && (
        <SelectableTextFocusLock>
          <DialogHeader
            id="modal-title"
            className="text-gray-950 text-xl font-bold dark:text-gray-50"
          >
            {title}
          </DialogHeader>
          <DialogBody
            id="modal-description"
            divider
            className="text-gray-950 text-lg font-normal leading-relaxed dark:text-gray-50"
          >
            {message}
          </DialogBody>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="text"
              color="gray"
              onClick={onCancel}
              ref={cancelButtonRef}
              data-testid="modal-cancel"
              className="bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="red"
              onClick={onConfirm}
              data-testid="modal-confirm"
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Confirm
            </Button>
          </DialogFooter>
        </SelectableTextFocusLock>
      )}
    </Dialog>
  );
};

export default Modal;
