import { toast } from 'sonner';

/**
 * Standardized hook for raising toast notifications.
 * success -> green, error -> red, warning -> yellow, info -> blue.
 */
export const useToast = () => {
  return {
    success: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      toast.error(message, { description });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    info: (message: string, description?: string) => {
      toast.info(message, { description });
    }
  };
};

export default useToast;
