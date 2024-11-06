import { FC } from 'react';

interface ModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const Modal: FC<ModalProps> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md">
                <h2 className="text-xl mb-2">{title}</h2>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-md">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
