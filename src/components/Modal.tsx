import { FC, useRef, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import FocusLock from "react-focus-lock";

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
      className="max-w-md border border-gray-300 bg-white text-black shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
    >
      {isOpen && (
        <FocusLock returnFocus>
          <DialogHeader
            id="modal-title"
            className="text-xl font-bold text-black dark:text-white"
          >
            {title}
          </DialogHeader>
          <DialogBody
            id="modal-description"
            divider
            className="text-lg font-normal leading-relaxed text-gray-800 dark:text-gray-200"
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
        </FocusLock>
      )}
    </Dialog>
  );
};

export default Modal;
