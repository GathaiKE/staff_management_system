import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Result } from '../../../utilities/utilities';
import { NewShift, Shift, StaffShift, StaffShiftPayload, User } from '../../interfaces/interfaces';
import { BehaviorSubject, catchError, map, Observable, of, Subscription } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
  private baseUrl:string = environment.BASE_URL
  private token?:string | undefined = typeof localStorage !== 'undefined'?localStorage.getItem("token") as string | undefined:undefined
  user:User | null = null
  headers = new HttpHeaders({
    'Content-Type':'application/json',
    'Authorization':`Token ${this.token}`
  })

  httpOptions = {
    headers:this.headers
  }

  constructor(private http:HttpClient, private authservice:AuthService) { 
    this.authservice.activeUser()
    this.authservice.currentUser$.subscribe(user=>this.user = user)
  }

  registerShift(shift:NewShift):Observable<Result<Shift>>{
    return this.http.post<any>(`${this.baseUrl}/apps/shift`, shift, this.httpOptions).pipe(
      map(res=>{
        this.getShifts()
        return ({data:res} as Result<Shift>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{},error:err} as Result<Shift>))
    )
  }

  fetch(){
    this.getShifts()
    this.getStaffShift()
  }

  private getShifts():Subscription{
    return this.http.get<Shift[]>(`${this.baseUrl}/apps/shift`, this.httpOptions).pipe(
      map(res=>({data:res} as Result<Shift[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[], error:err} as Result<Shift[]>))
    ).subscribe(res=>{
      const data:Shift[] = res.data.filter(i=>i.organization.id === this.user?.user_organization.organization.id)
      this.shiftsSub.next(data)
      this.shiftsErrSub.next(res.error)
    })
  }

  updateShift(id:string,shift:NewShift):Observable<Result<Shift>>{
    return this.http.put<any>(`${this.baseUrl}/apps/shift/${id}/`, shift, this.httpOptions).pipe(
      map(res=>{
        this.getShifts()
        return ({data:res} as Result<Shift>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{},error:err} as Result<Shift>))
    )
  }

  deleteShift(id:string):Observable<Result<any>>{
    return this.http.delete<any>(`${this.baseUrl}/apps/shift/${id}/`, this.httpOptions).pipe(
      map(res=>{
        this.getShifts()
        return ({data:res} as Result<any>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:undefined, error:err} as Result<any>))
    )
  }

  appointShift(data:StaffShiftPayload):Observable<Result<StaffShift>>{
    return this.http.post<any>(`${this.baseUrl}/apps/staffshift`, data, this.httpOptions).pipe(
      map(res=>{
            this.getStaffShift()
        return ({data:res} as Result<StaffShift>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<StaffShift>))
    )
  }

  getStaffShift():Subscription{
    return this.http.get<StaffShift[]>(`${this.baseUrl}/apps/staffshift`, this.httpOptions).pipe(
      map(res=>({data:res} as Result<StaffShift[]>)),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<StaffShift[]>))
    ).subscribe(res=>{
      this.staffShiftsSub.next(res.data)
      this.staffShiftErrSub.next(res.error)
    }
    )
  }  

  private shiftsSub:BehaviorSubject<Shift[]> = new BehaviorSubject<Shift[]>([])
  private shiftsErrSub:BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null)
  shifts$:Observable<Shift[]> = this.shiftsSub.asObservable()
  shiftErr$:Observable<HttpErrorResponse | null> = this.shiftsErrSub.asObservable()

  // Staff shifts
  private staffShiftsSub:BehaviorSubject<StaffShift[]> = new BehaviorSubject<StaffShift[]>([])
  private staffShiftErrSub:BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null)
  staffShifts$:Observable<StaffShift[]> = this.staffShiftsSub.asObservable()
  staffShiftErr$:Observable<HttpErrorResponse | null> = this.staffShiftErrSub.asObservable()
}
