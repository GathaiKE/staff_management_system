export interface UserFormData {
    firstName: string
    middleName: string
    lastName: string
    email: string
    dob: string
    phoneNumber: string
    address?: string
    branch?: string
    department: string
    password: string
    staffNumber: string,
    idNumber: string
    organization?:string
}

export interface NewStaff {
    first_name: string
    middle_name: string
    last_name: string
    email: string
    user_dob: string
    phone_number: string
    user_address?: string
    branch?: string
    id_number: string
    staff_department: string
    password: string
    organization: string
    is_staff: boolean
    is_superuser: boolean
    is_assistant_superadmin: boolean
    is_organizationadmin: boolean
    is_branchadmin: boolean
    is_buildingadmin: boolean
    staff_number: string,
    profile_pic: null | string,
    staff_status: boolean,
}

export interface User {
    id: string
    user_organization: {
        id: string
        organization: Organization,
        branch: Branch,
        user: string
    },
    password: string
    last_login: string | null
    is_superuser: boolean
    first_name: string
    last_name: string
    is_staff: boolean
    is_active: boolean
    date_joined: string
    email: string
    is_assistant_superadmin: boolean
    is_organizationadmin: boolean
    is_branchadmin: boolean
    is_buildingadmin: boolean
    id_number: string
    profile_pic: string | null
    user_dob: string
    user_address: string | null
    middle_name: string
    staff_number: string
    staff_status: boolean
    is_checked_in:boolean
    staff_department: string | null
    phone_number: string
    groups: any[],
    user_permissions: any[]
}

export interface OrganizationFormData {
    orgName: string
    phoneNumber: string
    address: string
    email: string
    status: boolean
}

export interface UpdatedOrganizationFormData {
    orgName: string
    phoneNumber: string
    address: string
    email: string
    status: boolean
}

export interface NewOrganization {
    name: string
    organization_tel: string
    organization_location: string
    organization_email: string
    status: boolean
}

export interface Organization {
    id: string
    name: string
    org_identifier: string
    organization_email: string
    organization_tel: string
    organization_location: string
    created_at: string
    updated_at: string | null
    deleted_at: string | null
}


export interface Branch {
    id: string
    branch_number: string
    name: string
    location: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    organization: Organization
}

export interface NewBranchFormData {
    address: string
    branchName: string
    branchNumber: string
    status: boolean
}

export interface NewBranch {
    organization: string
    name: string
    branch_number: string
    location: string
}

export interface LeaveTypeFormData {
    name: string
    days: number
    status: boolean
}

export interface NewLeaveType {
    type: string
    days: string,
    organization: string
}

export interface Leave {
    id: string
    type: string
    days: string
    organization: Organization
    created_at: string
    updated_at: string | null
    deleted_at: string | null
}

export interface LeaveApplicationData {
    id: string
    user: User
    start_date: string
    end_date: string
    reason: string | null
    description: string | null
}

export interface LeaveApplication {
    id: string
    application: LeaveApplicationData
    status: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export interface NewLeaveApplication {
    start_date: string
    end_date: string
    reason: string
    user: string
    leavetype: string
    leave_days: string
}

export interface LeaveApplicationFormData {
    endDate: string
    startDate: string
    leaveType: string
}

export interface LeavesResponse {
    id: string
    application: {
        id: string
        leavetype: Leave
        user: User
        start_date: string
        end_date: string
        reason: string | null
        leave_days: string
        description: string | null
    },
    status: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}



export interface Shift {
    id: string
    type: string
    start_time: string
    start_date: string
    repeat: string
    days: string[]
    organization: Organization
    number_of_workers: string
    end_time: string
    end_date: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export interface NewShift {
    type: string
    start_time: string
    end_time: string
    start_date: string
    repeat: string
    days: string[]
    organization: string
    number_of_workers: string
    end_date: string
}

export interface ShiftFormData {
    role: string
    repeat: string
    startDate: string
    endDate: string
    startTime: string
    days: string[]
    endTime: string
    staffCount: number
}

export interface StaffShiftPayload {
    user: string
    shift?: string
}

export interface StaffShift {
    created_at: string
    deleted_at: string | null
    id: string
    shift: Shift
    updated_at: string
    user: User
}

export interface NewAdmin {
    is_assistant_superadmin: boolean
    is_organizationadmin: boolean
    is_branchadmin: boolean
    is_buildingadmin: boolean
}

export interface CheckInData {
    id: string
    organization: Organization
    user: User
    is_checked_in: false,
    checkin_time: string
    checkout_time: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    building: string | null
}

export interface Message {
    id: string
    message_title: string
    body: string
    message_type: string
    message_status: string
    file_uploaded: string
    created_at: string
    updated_at: string
    deleted_at: string
    user: string
}

export interface NewsFormData {
    image:File | null
    title:string
    body:string
}

export interface NewPost {
    message_title:string
    user:string
    body:string
    file_uploaded:File | null
    message_type: 'memo' | 'news'
}

export interface UpdatedPost {
    message_title:string
    body:string
    file_uploaded:File | null
    message_type: 'memo' | 'news'
}

export interface Publication {
    id: string
    user:User
    message_title: string
    body: string
    message_type:  'memo' | 'news'
    message_status: string
    file_uploaded: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}