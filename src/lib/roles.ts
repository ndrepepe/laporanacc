export const USER_ROLES = [
    'Accounting Staff',
    'Cashier',
    'Consignment Staff',
    'Consignment Supervisor',
    'Accounting Manager',
    'Senior Manager',
] as const;

export type UserRole = typeof USER_ROLES[number];

// Define which roles can view which other roles' reports.
// Key: Viewer Role, Value: Array of roles they can view.
export const VIEW_PERMISSIONS: Record<UserRole, UserRole[]> = {
    'Accounting Staff': ['Accounting Staff'],
    'Cashier': ['Cashier'],
    'Consignment Staff': ['Consignment Staff'],
    
    // Supervisors/Managers can view their own department staff reports
    'Consignment Supervisor': ['Consignment Supervisor', 'Consignment Staff'],
    'Accounting Manager': ['Accounting Manager', 'Accounting Staff', 'Cashier'],
    
    // Senior Manager can view all reports
    'Senior Manager': [
        'Accounting Staff',
        'Cashier',
        'Consignment Staff',
        'Consignment Supervisor',
        'Accounting Manager',
        'Senior Manager',
    ],
};

// Helper function to check if a user can view a specific report type
export const canViewReport = (viewerRole: UserRole | null, reportRole: UserRole): boolean => {
    if (!viewerRole) return false;
    return VIEW_PERMISSIONS[viewerRole]?.includes(reportRole) ?? false;
};