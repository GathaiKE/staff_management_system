import { User } from "../dashboard/interfaces/interfaces"

export interface LoginFormData{
	email:string
	password:string
}

export interface LoginResponse{
	token:string
	user:User
}