import { StateCreator } from "zustand";

const TOAST_LIMIT = 5;

type ToastStatus = "Success" | "Error" | "Warning";

interface Toast {
    status: ToastStatus;
    id: string;
    title: string;
    description: string;
    duration: number; // duration in seconds
}

let genId: () => string;
{
    let id = 0;
    genId = function () {
        id = (id + 1) % Number.MAX_VALUE;
        return `toast-${id}`;
    };
}

function newToast(
    status: ToastStatus,
    title: string,
    description: string,
    duration: number = 5
) {
    const id = genId();
    return {
        status,
        id,
        title,
        description,
        duration,
    };
}

export interface ToastSlice {
    toasts: Toast[];
    toastTimeouts: Map<string, ReturnType<typeof setTimeout>>;
    addToast: (
        status: ToastStatus,
        title: string,
        description: string,
        duration?: number
    ) => void;
    removeToast: (toasId: string) => void;
}

export const createToastSlice: StateCreator<ToastSlice> = (set, get) => ({
    toasts: [],
    addToast(status, title, description, duration) {
        const toast = newToast(status, title, description, duration);
        const timeout = setTimeout(
            () => get().removeToast(toast.id),
            toast.duration * 1000
        );
        return set((state) => ({
            toasts: [toast, ...state.toasts].slice(0, TOAST_LIMIT),
            toastTimeouts: new Map(state.toastTimeouts).set(toast.id, timeout),
        }));
    },
    removeToast(toastId) {
        const timeouts = get().toastTimeouts;
        if (timeouts.has(toastId)) {
            clearTimeout(timeouts.get(toastId));
        }
        return set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== toastId),
            toastTimeout: new Map(state.toastTimeouts).delete(toastId),
        }));
    },
    toastTimeouts: new Map(),
});
