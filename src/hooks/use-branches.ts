import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

export type Branch = {
    id: string;
    name: string;
    created_at: string;
};

const fetchBranches = async (): Promise<Branch[]> => {
    const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching branches:", error);
        showError("Failed to load branch list.");
        return [];
    }
    return data || [];
};

export const useBranches = () => {
    return useQuery<Branch[], Error>({
        queryKey: ['branches'],
        queryFn: fetchBranches,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};