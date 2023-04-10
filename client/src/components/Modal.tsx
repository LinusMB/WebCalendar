import React from "react";

import "./Modal.css";

export interface ModalProps {
    children?: React.ReactNode;
}

const Modal = ({ children }: ModalProps) => {
    return (
        <div className="modal">
            <div className="modal__content">{children}</div>
        </div>
    );
};

export interface ModalHeaderProps {
    children?: React.ReactNode;
}

Modal.Header = ({ children }: ModalHeaderProps) => {
    return <div className="modal__header">{children}</div>;
};

export interface ModalCloseButtonProps {
    onClick: () => void;
}

Modal.CloseButton = ({ onClick }: ModalCloseButtonProps) => {
    return (
        <span onClick={onClick} className="modal__close">
            &times;
        </span>
    );
};

export interface ModalBodyProps {
    children?: React.ReactNode;
}

Modal.Body = ({ children }: ModalBodyProps) => {
    return <div className="modal__body">{children}</div>;
};

export interface ModalFooterProps {
    children?: React.ReactNode;
}

Modal.Footer = ({ children }: ModalFooterProps) => {
    return <div className="modal__footer">{children}</div>;
};

export default Modal;
