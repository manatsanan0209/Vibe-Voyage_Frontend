import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useI18n } from '@/hooks/useI18n';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function NavLogout() {
    const { logout } = useAuth();
    const { t } = useI18n();
    const [open, setOpen] = useState(false);

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setOpen(true)}
                    className="h-10.75 rounded-none px-6 font-bold text-sm text-[#f6373a] transition-all duration-200 hover:rounded-[20px] hover:bg-red-50 hover:text-[#f6373a] group-data-[collapsible=icon]:h-10.75! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:justify-center!"
                >
                    <LogOut className="size-5 shrink-0 group-data-[collapsible=icon]:size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                        {t('nav.logout')}
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {t('nav.logoutConfirm.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('nav.logoutConfirm.message')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            {t('nav.logoutConfirm.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setOpen(false);
                                logout();
                            }}
                        >
                            {t('nav.logoutConfirm.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
