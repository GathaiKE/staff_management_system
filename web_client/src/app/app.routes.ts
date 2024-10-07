import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:'', loadComponent:()=>import('../app/auth/login/login.component').then(c=>c.LoginComponent)},
    {path:'reset', loadComponent:()=>import('../app/auth/verify-details/verify-details.component').then(c=>c.VerifyDetailsComponent)},
    {path:'new-password', loadComponent:()=>import('../app/auth/reset-password/reset-password.component').then(c=>c.ResetPasswordComponent)},
    {
        path:'admins', loadComponent:()=>import('../app/dashboard/admins/admins.component').then(c=>c.AdminsComponent),
        children:[
            {
                path:'assistant', loadComponent:()=>import('../app/dashboard/admins/assistant-admins/assistant-admins.component').then(c=>c.AssistantAdminsComponent),
                children:[
                    {path:'', loadComponent:()=>import('../app/dashboard/admins/assistant-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'all', loadComponent:()=>import('../app/dashboard/admins/assistant-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'active', loadComponent:()=>import('../app/dashboard/admins/assistant-admins/active/active.component').then(c=>c.ActiveComponent)},
                    {path:'inactive', loadComponent:()=>import('../app/dashboard/admins/assistant-admins/inactive/inactive.component').then(c=>c.InactiveComponent)}
                ]
            },
            {
                path:'client', loadComponent:()=>import('../app/dashboard/admins/organization-admins/organization-admins.component').then(c=>c.OrganizationAdminsComponent),
                children:[
                    {path:'', loadComponent:()=>import('../app/dashboard/admins/organization-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'all', loadComponent:()=>import('../app/dashboard/admins/organization-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'active', loadComponent:()=>import('../app/dashboard/admins/organization-admins/active/active.component').then(c=>c.ActiveComponent)},
                    {path:'inactive', loadComponent:()=>import('../app/dashboard/admins/organization-admins/inactive/inactive.component').then(c=>c.InactiveComponent)}
                ]
            },
            {
                path:'branch', loadComponent:()=>import('../app/dashboard/admins/branch-admins/branch-admins.component').then(c=>c.BranchAdminsComponent),
                children:[
                    {path:'', loadComponent:()=>import('../app/dashboard/admins/branch-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'all', loadComponent:()=>import('../app/dashboard/admins/branch-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'active', loadComponent:()=>import('../app/dashboard/admins/branch-admins/active/active.component').then(c=>c.ActiveComponent)},
                    {path:'inactive', loadComponent:()=>import('../app/dashboard/admins/branch-admins/inactive/inactive.component').then(c=>c.InactiveComponent)}
                ]
            },
            {
                path:'building', loadComponent:()=>import('../app/dashboard/admins/building-admins/building-admins.component').then(c=>c.BuildingAdminsComponent),
                children:[
                    {path:'', loadComponent:()=>import('../app/dashboard/admins/building-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'all', loadComponent:()=>import('../app/dashboard/admins/building-admins/all/all.component').then(c=>c.AllComponent)},
                    {path:'active', loadComponent:()=>import('../app/dashboard/admins/building-admins/active/active.component').then(c=>c.ActiveComponent)},
                    {path:'inactive', loadComponent:()=>import('../app/dashboard/admins/building-admins/inactive/inactive.component').then(c=>c.InactiveComponent)}
                ]
            }
        ]
    },
    {path:'assistant', loadComponent:()=>import('../app/dashboard/admins/assistant-admins/assistant-admins.component').then(c=>c.AssistantAdminsComponent)},
    {path:'building', loadComponent:()=>import('../app/dashboard/admins/building-admins/building-admins.component').then(c=>c.BuildingAdminsComponent)},
    {path:'branch', loadComponent:()=>import('../app/dashboard/admins/branch-admins/branch-admins.component').then(c=>c.BranchAdminsComponent)},
    {path:'client', loadComponent:()=>import('../app/dashboard/admins/organization-admins/organization-admins.component').then(c=>c.OrganizationAdminsComponent)},
    {
        path:'attendance', loadComponent:()=>import('../app/dashboard/attendance/attendance.component').then(c=>c.AttendanceComponent),
        children:[
            {path:'all', loadComponent:()=>import('../app/dashboard/attendance/all/all.component').then(c=>c.AllComponent)},
            {path:'on-time', loadComponent:()=>import('../app/dashboard/attendance/on-time/on-time.component').then(c=>c.OnTimeComponent)},
            {path:'late', loadComponent:()=>import('../app/dashboard/attendance/late/late.component').then(c=>c.LateComponent)},
            {path:'on-leave', loadComponent:()=>import('../app/dashboard/attendance/on-leave/on-leave.component').then(c=>c.OnLeaveComponent)},
            {path:'absent', loadComponent:()=>import('../app/dashboard/attendance/absent/absent.component').then(c=>c.AbsentComponent)},
        ]
    },
    {path:'chatroom', loadComponent:()=>import('../app/dashboard/chatroom/chatroom.component').then(c=>c.ChatroomComponent)},
    {
        path:'leaves',
        loadComponent:()=>import('../app/dashboard/leaves/leaves.component').then(c=>c.LeavesComponent),
        children:[
            {path:'',loadComponent:()=>import('../app/dashboard/leaves/requests/requests.component').then(c=>c.RequestsComponent)},
            {
                path:'requests',loadComponent:()=>import('../app/dashboard/leaves/requests/requests.component').then(c=>c.RequestsComponent),
                children:[
                    {path:'pending',loadComponent:()=>import('../app/dashboard/leaves/requests/pending/pending.component').then(c=>c.PendingComponent)},
                    {path:'approved',loadComponent:()=>import('../app/dashboard/leaves/requests/approved/approved.component').then(c=>c.ApprovedComponent)},
                    {path:'rejected',loadComponent:()=>import('../app/dashboard/leaves/requests/disapproved/disapproved.component').then(c=>c.DisapprovedComponent)}
                ]
            },
            {path:'types', loadComponent:()=>import('../app/dashboard/leaves/types/types.component').then(c=>c.TypesComponent)}
        ]
    },
    {
        path:'news', loadComponent:()=>import('../app/dashboard/news/news.component').then(c=>c.NewsComponent),
        children:[
            {path:'',loadComponent:()=>import('../app/dashboard/news/company-news/company-news.component').then(c=>c.CompanyNewsComponent)},
            {path:'news',loadComponent:()=>import('../app/dashboard/news/company-news/company-news.component').then(c=>c.CompanyNewsComponent)},
            {path:'memos',loadComponent:()=>import('../app/dashboard/news/company-memos/company-memos.component').then(c=>c.CompanyMemosComponent)},
        ]
    },
    {
        path:'organizations', loadComponent:()=>import('../app/dashboard/organizations/organizations.component').then(c=>c.OrganizationsComponent),
        children:[
            {path:'',loadComponent:()=>import('../app/dashboard/organizations/all-organizations/all-organizations.component').then(c=>c.AllOrganizationsComponent)},
            {path:'all',loadComponent:()=>import('../app/dashboard/organizations/all-organizations/all-organizations.component').then(c=>c.AllOrganizationsComponent)},
            {path:'active',loadComponent:()=>import('../app/dashboard/organizations/active-organizations/active-organizations.component').then(c=>c.ActiveOrganizationsComponent)},
            {path:'inactive',loadComponent:()=>import('../app/dashboard/organizations/inactive-organizations/inactive-organizations.component').then(c=>c.InactiveOrganizationsComponent)},
        ]
    },
    {
        path:'shifts', loadComponent:()=>import('../app/dashboard/shifts/shifts.component').then(c=>c.ShiftsComponent),
        children:[
            {path:'company-shifts', loadComponent:()=>import('../app/dashboard/shifts/company-shifts/company-shifts.component').then(c=>c.CompanyShiftsComponent)},
            {path:'shift', loadComponent:()=>import('../app/dashboard/shifts/shift/shift.component').then(c=>c.ShiftComponent)}
        ]
    },
    {path:'payments', loadComponent:()=>import('../app/dashboard/payments/payments.component').then(c=>c.PaymentsComponent)},
    {
        path:'my-company', loadComponent:()=>import('./dashboard/my-company/my-company.component').then(c=>c.MyCompanyComponent),
        children:[
            {path:'branches',loadComponent:()=>import('./dashboard/my-company/branches/branches.component').then(c=>c.BranchesComponent)},
            {path:'buildings',loadComponent:()=>import('./dashboard/my-company/buildings/buildings.component').then(c=>c.BuildingsComponent)},
            {path:'payment-history',loadComponent:()=>import('./dashboard/my-company/payment-history/payment-history.component').then(c=>c.PaymentHistoryComponent)}
        ]
    },
    {
        path:'staff', loadComponent:()=>import('../app/dashboard/staff/staff.component').then(c=>c.StaffComponent),
        children:[
            {path:'', loadComponent:()=>import('../app/dashboard/staff/total/total.component').then(c=>c.TotalComponent)},
            {path:'all-staff', loadComponent:()=>import('../app/dashboard/staff/total/total.component').then(c=>c.TotalComponent)},
            {path:'suspended', loadComponent:()=>import('../app/dashboard/staff/suspended/suspended.component').then(c=>c.SuspendedComponent)},
            {path:'active', loadComponent:()=>import('../app/dashboard/staff/active/active.component').then(c=>c.ActiveComponent)},
            {path:'on-leave', loadComponent:()=>import('../app/dashboard/staff/on-leave/on-leave.component').then(c=>c.OnLeaveComponent)},
        ]

    },
    {
        path:'profile', loadComponent:()=>import('../app/dashboard/profile/profile.component').then(c=>c.ProfileComponent),
        children:[
            {path:'', loadComponent:()=>import('../app/dashboard/profile/company-communication/company-communication.component').then(c=>c.CompanyCommunicationComponent),
                children:[
                    {path:'',loadComponent:()=>import('../app/dashboard/profile/company-communication/company-news/company-news.component').then(c=>c.CompanyNewsComponent)},
                    {path:'news',loadComponent:()=>import('../app/dashboard/profile/company-communication/company-news/company-news.component').then(c=>c.CompanyNewsComponent)},
                    {path:'memos',loadComponent:()=>import('../app/dashboard/profile/company-communication/company-memos/company-memos.component').then(c=>c.CompanyMemosComponent)}
                ]
            },
            {path:'news', loadComponent:()=>import('../app/dashboard/profile/company-communication/company-communication.component').then(c=>c.CompanyCommunicationComponent),
                children:[
                    {path:'',loadComponent:()=>import('../app/dashboard/profile/company-communication/company-news/company-news.component').then(c=>c.CompanyNewsComponent)},
                    {path:'news',loadComponent:()=>import('../app/dashboard/profile/company-communication/company-news/company-news.component').then(c=>c.CompanyNewsComponent)},
                    {path:'memos',loadComponent:()=>import('../app/dashboard/profile/company-communication/company-memos/company-memos.component').then(c=>c.CompanyMemosComponent)}
                ]
            }, 
            {path:'my-shifts', loadComponent:()=>import('../app/dashboard/profile/my-shifts/my-shifts.component').then(c=>c.MyShiftsComponent)},
            {path:'my-applications', loadComponent:()=>import('../app/dashboard/profile/my-leave-applications/my-leave-applications.component').then(c=>c.MyLeaveApplicationsComponent)}
        ]
    },
    {path:'analytics', loadComponent:()=>import('../app/dashboard/analytics/analytics.component').then(c=>c.AnalyticsComponent)},
    {
        path:'organization', loadComponent:()=>import('../app/dashboard/organizations/organization-details/organization-details.component').then(c=>c.OrganizationDetailsComponent),
        children:[
            {path:'',loadComponent:()=>import('../app/dashboard/organizations/organization-details/branches/branches.component').then(c=>c.BranchesComponent)},
            {path:'branches',loadComponent:()=>import('../app/dashboard/organizations/organization-details/branches/branches.component').then(c=>c.BranchesComponent)},
            {path:'buildings',loadComponent:()=>import('../app/dashboard/organizations/organization-details/buildings/buildings.component').then(c=>c.BuildingsComponent)},
            {path:'payment-history',loadComponent:()=>import('../app/dashboard/organizations/organization-details/payment-history/payment-history.component').then(c=>c.PaymentHistoryComponent)}
        ]
    },
    {
        path:'user', loadComponent:()=>import(`../app/dashboard/staff/details/details.component`).then(c=>c.DetailsComponent), 
        children:[
            {path:'', loadComponent:()=>import(`../app/dashboard/staff/details/leaves/leaves.component`).then(c=>c.LeavesComponent)},
            {path:'leaves', loadComponent:()=>import(`../app/dashboard/staff/details/leaves/leaves.component`).then(c=>c.LeavesComponent)},
            {path:'shifts', loadComponent:()=>import(`../app/dashboard/staff/details/shifts/shifts.component`).then(c=>c.ShiftsComponent)}
        ]
    }
];
