import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-md group-[.toaster]:rounded-md group-[.toaster]:text-sm group-[.toaster]:p-3",
          description: "group-[.toast]:text-gray-500 group-[.toast]:text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-xs group-[.toast]:h-7 group-[.toast]:px-2.5 group-[.toast]:rounded",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:text-xs group-[.toast]:h-7 group-[.toast]:px-2.5 group-[.toast]:rounded",
          success: "group-[.toaster]:border-l-2 group-[.toaster]:border-l-success",
          error:   "group-[.toaster]:border-l-2 group-[.toaster]:border-l-destructive",
          warning: "group-[.toaster]:border-l-2 group-[.toaster]:border-l-warning",
          info:    "group-[.toaster]:border-l-2 group-[.toaster]:border-l-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
