import React from 'react';

const ConfirmDialog = ({ open, title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-6">
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                {message && <p className="text-sm text-gray-600 mb-5">{message}</p>}
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">{cancelText}</button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-white ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;


