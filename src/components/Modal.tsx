import { FC } from "react";

interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Modal: FC<ModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-3 text-xl font-semibold text-black dark:text-white">
          {title}
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-300 px-4 py-2 text-black hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            data-testid="modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
            data-testid="modal-confirm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
