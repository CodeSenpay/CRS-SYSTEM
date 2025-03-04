import { toast } from "react-toastify";

export const notifySucccess = (message) => toast.success(message);

export const notifyError = (message) => toast.error(message);
