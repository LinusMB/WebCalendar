import React from "react";

import "./Styles.css";

export interface ModalProps extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
}

const Modal = ({ children, ...props }: ModalProps) => {
    return (
        <div className="modal">
            <div className="modal__content" {...props}>
                {children}
            </div>
        </div>
    );
};

export interface ModalHeaderProps
    extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
}

Modal.Header = ({ children, ...props }: ModalHeaderProps) => {
    return (
        <div className="modal__header" {...props}>
            {children}
        </div>
    );
};

export interface ModalCloseButtonProps
    extends React.ComponentPropsWithoutRef<"span"> {
    onClick: () => void;
}

Modal.CloseButton = ({ onClick, ...props }: ModalCloseButtonProps) => {
    return (
        <span onClick={onClick} className="modal__close" {...props}>
            &times;
        </span>
    );
};

export interface ModalBodyProps extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
    className?: string;
}

Modal.Body = ({ children, className, ...props }: ModalBodyProps) => {
    return (
        <div className={`modal__body ${className}`} {...props}>
            {children}
        </div>
    );
};

export interface ModalFooterProps
    extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
}

Modal.Footer = ({ children, ...props }: ModalFooterProps) => {
    return (
        <div className="modal__footer" {...props}>
            {children}
        </div>
    );
};

export default Modal;
