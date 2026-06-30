import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning"
}

export const toast = ({ title, description, variant }: ToastProps) => {
  if (variant === "destructive") {
    return sonnerToast.error(title, { description })
  } else if (variant === "success") {
    return sonnerToast.success(title, { description })
  } else if (variant === "warning") {
    return sonnerToast.warning(title, { description })
  }
  return sonnerToast(title, { description })
}

export function useToast() {
  return {
    toast,
  }
}
