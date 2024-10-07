import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Leave, LeaveApplication, LeaveApplicationData, LeavesResponse, NewLeaveApplication, NewLeaveType, User } from '../../interfaces/interfaces';
import { BehaviorSubject, Observable, Subscription, catchError, map, of, tap } from 'rxjs';
import { Result } from '../../../utilities/utilities';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private baseUrl:string = environment.BASE_URL
  private token?:string | undefined = typeof localStorage !== 'undefined'?localStorage.getItem("token") as string | undefined:undefined
  private currentUser:User | null = null

  headers = new HttpHeaders({
    'Content-Type':'application/json',
    'Authorization':`Token ${this.token}`
  })

  httpOptions = {
    headers:this.headers
  }

  constructor(private http:HttpClient, private authService:AuthService) {
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      this.currentUser = user as User
    })
   }

  fetch():void{
    this.getLeaveTypes()
    this.getLeaveApplications()
  }

  addLeaveType(data:NewLeaveType):Observable<Result<Leave>>{
    return this.http.post<any>(`${this.baseUrl}/apps/leavetype`,data, this.httpOptions).pipe(
      map(res=>{
        this.getLeaveTypes()
        return ({data:res} as Result<Leave>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<Leave>))
    )
  }

  // deleteLeavetype(id:string):Observable<any>{
  //   return this.http.delete<any>(`${this.baseUrl}/apps/leavetype/${id}/`, this.httpOptions).pipe(tap(()=>this.getLeaveTypes()))
  // }

  updateLeaveType(id:string, data:NewLeaveType):Observable<Result<Leave>>{
    return this.http.put<any>(`${this.baseUrl}/apps/leavetype/${id}/`,data, this.httpOptions).pipe(
      map(res=>{
        this.getLeaveTypes()
        return ({data:res} as Result<Leave>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<Leave>))
    )
  }

  sendLeaveApplication(leave:NewLeaveApplication):Observable<Result<LeaveApplicationData>>{
    return this.http.post<any>(`${this.baseUrl}/apps/leaveapplication`, leave, this.httpOptions).pipe(
      map(res=>{
        return ({data:res}as Result<LeaveApplicationData>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<LeaveApplicationData>))
    )
  }

  setApplicationStatus(id:string):Observable<Result<LeaveApplication>>{
    const payload = {
      application:id,
      status:'pending'
    }
    return this.http.post<any>(`${this.baseUrl}/apps/leaveapplicationstatus`,payload, this.httpOptions).pipe(
    map(res=>{
      this.getLeaveApplications()
      return ({data:res} as Result<LeaveApplication>)
    }),
    catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<LeaveApplication>))
    )
  }

  updateApplicationStatus(id:string, status:'approved' | 'pending' | 'rejected'):Observable<Result<LeaveApplication>>{
    return this.http.put<any>(`${this.baseUrl}/apps/leaveapplicationstatus/${id}/`, {status:status}, this.httpOptions).pipe(
      map(res=>{
        this.getLeaveApplications()
        return ({data:res} as Result<LeaveApplication>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<LeaveApplication>))
    )
  }


  private getLeaveTypes():Subscription{
    return this.http.get<Leave[]>(`${this.baseUrl}/apps/leavetype`, this.httpOptions).pipe(
      map(res=>({data:res} as Result<Leave[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[], error:err} as Result<Leave[]>))
    ).subscribe(res=>{
      const data:Leave[] = res.data.filter(i=>i.organization.id === this.currentUser?.user_organization.organization.id)
      this.leaveTypeSub.next(data)
      this.leaveTypeErrSub.next(res.error)
    })
  }

  private getLeaveApplications():Subscription{
    return this.http.get<LeavesResponse[]>(`${this.baseUrl}/apps/leaveapplicationstatus`, this.httpOptions).pipe(
      map(res=>({data:res} as Result<LeavesResponse[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[], error:err} as Result<LeavesResponse[]>))
    ).subscribe(res=>{
      let data:LeavesResponse[];
      if(this.currentUser?.is_organizationadmin){
        data = res.data.filter(i=>i.application.user.user_organization.organization.id === this.currentUser?.user_organization.organization.id)
      } else if(this.currentUser?.is_branchadmin){
        data = res.data.filter(i=>i.application.user.user_organization.branch.id === this.currentUser?.user_organization.branch.id)
      }else{
        data = []
      }
      this.leaveApplicationsSub.next(data)
      this.leaveApplicationsErrSub.next(res.error)
    })
  }

  // Leave types
  private leaveTypeSub:BehaviorSubject<Leave[] | undefined> = new BehaviorSubject<Leave[] | undefined>(undefined)
  private leaveTypeErrSub:BehaviorSubject<HttpErrorResponse | undefined> = new BehaviorSubject<HttpErrorResponse | undefined>(undefined)
  leaveType$:Observable<Leave[] | undefined> = this.leaveTypeSub.asObservable()
  leaveTypeErr$:Observable<HttpErrorResponse | undefined> = this.leaveTypeErrSub.asObservable()

  // Leave applications
  private leaveApplicationsSub:BehaviorSubject<LeavesResponse[] | undefined> = new BehaviorSubject<LeavesResponse[] | undefined>(undefined)
  private leaveApplicationsErrSub:BehaviorSubject<HttpErrorResponse | undefined> = new BehaviorSubject<HttpErrorResponse | undefined>(undefined)
  leaveApplications$:Observable<LeavesResponse[] | undefined> = this.leaveApplicationsSub.asObservable()
  leaveApplicationsErr$:Observable<HttpErrorResponse | undefined> = this.leaveApplicationsErrSub.asObservable()
}
