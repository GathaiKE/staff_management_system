import { HttpErrorResponse } from "@angular/common/http"

export interface Form{
    size?:string,
    title?:string,
    message?:string
    duration?:string,
    activeForm?:string
    action?:{
        abort?:string,
        submit?:string
    }
    data?:any
        
}

export interface Result<T>{
    data:T
    error:HttpErrorResponse
}