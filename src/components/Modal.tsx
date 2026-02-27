import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onConfirm, confirmText = '확인' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ minWidth: '300px', maxWidth: '400px', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{title}</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>{message}</p>
                <button className="btn btn-primary" onClick={onConfirm} style={{ width: '100%' }}>
                    {confirmText}
                </button>
            </div>
        </div>
    );
};

export default Modal;
