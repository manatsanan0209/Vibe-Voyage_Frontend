import { Toaster as Sonner } from 'sonner';

export function Toaster() {
    return (
        <Sonner
            className="toaster"
            position="bottom-right"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:shadow-lg group-[.toaster]:border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border data-[type=success]:border-emerald-200 data-[type=success]:bg-emerald-50 data-[type=success]:text-emerald-900 data-[type=error]:border-red-200 data-[type=error]:bg-red-50 data-[type=error]:text-red-800 data-[type=info]:border-sky-200 data-[type=info]:bg-sky-50 data-[type=info]:text-sky-900 data-[type=warning]:border-amber-200 data-[type=warning]:bg-amber-50 data-[type=warning]:text-amber-900',
                    description: 'group-[.toast]:text-foreground/70',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-foreground',
                },
            }}
        />
    );
}
