import { FC, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { SelectableTextFocusLock } from "./SelectableTextFocusLock.tsx";
import { useDarkModeClassName } from "../hooks/dark-mode-classnames.ts";

interface ModalProps {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const Modal: FC<ModalProps> = ({
  title,
  message,
  confirmText,
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
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent
        className={`${darkModeClassName} max-w-md border border-neutral-300 bg-white text-neutral-950 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50`}
      >
        <SelectableTextFocusLock>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription className="pt-4 pb-6 text-lg leading-relaxed font-normal">
              {message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={onCancel}
                ref={cancelButtonRef}
                data-testid="modal-cancel"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="confirmDanger"
              onClick={onConfirm}
              data-testid="modal-confirm"
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </SelectableTextFocusLock>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
