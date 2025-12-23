import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showError } from "@/utils/toast";

export interface Notification {
    id: string;
    recipient_id: string;
    sender_id: string | null;
    type: 'report_submission' | 'report_view';
    message: string;
    is_read: boolean;
    created_at: string;
}

const fetchNotifications = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('id, type, message, is_read, created_at, sender_id')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to latest 50 for speed

    if (error) {
        console.error("Error fetching notifications:", error);
        showError("Failed to load notifications.");
        throw error;
    }
    return data as Notification[];
};

export const useNotifications = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const userId = user?.id;
    const queryClient = useQueryClient();

    const query = useQuery<Notification[], Error>({
        queryKey: ['notifications', userId],
        queryFn: () => fetchNotifications(userId!),
        enabled: !!userId && !isAuthLoading,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (notificationIds: string[]) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .in('id', notificationIds);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        },
        onError: (error) => {
            showError(`Failed to mark read: ${error.message}`);
        }
    });

    const markAllAsRead = () => {
        if (query.data) {
            const unreadIds = query.data.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length > 0) {
                markAsReadMutation.mutate(unreadIds);
            }
        }
    };

    return {
        ...query,
        markAsReadMutation,
        markAllAsRead,
        unreadCount: query.data?.filter(n => !n.is_read).length || 0,
    };
};