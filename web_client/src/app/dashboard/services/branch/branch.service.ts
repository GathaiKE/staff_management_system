import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, Subject, Subscription } from 'rxjs';
import { Branch, NewBranch, User } from '../../interfaces/interfaces';
import { Result } from '../../../utilities/utilities';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private baseUrl:string = environment.BASE_URL
  private token?:string | undefined = typeof localStorage !== 'undefined'?localStorage.getItem("token") as string | undefined:undefined
  currentUser:User | null = null
  headers = new HttpHeaders({
    'Content-Type':'application/json',
    'Authorization':`Token ${this.token}`
  })

  httpOptions = {
    headers:this.headers
  }

  constructor(private http:HttpClient, private authService:AuthService) {
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>this.currentUser = user)
   }

  registerBranch(data:NewBranch):Observable<Result<Branch>>{
    return this.http.post<any>(`${this.baseUrl}/apps/branch`, data, this.httpOptions).pipe(
      map(res=>{
        this.getBranches()
        return ({data:res}as Result<Branch>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<Branch>))
    )
  }


updateBranch(data:any, id:string):Observable<Result<Branch>>{
    return this.http.put<any>(`${this.baseUrl}/apps/branch/${id}/`, data, this.httpOptions).pipe(
      map(res=>{
        this.getBranches()
        return ({data:res}as Result<Branch>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<Branch>))
    )
  }

  deleteBranch(id:string):Observable<Result<any>>{
    return this.http.delete<any>(`${this.baseUrl}/apps/branch/${id}/`, this.httpOptions).pipe(
      map(res=>{
        this.getBranches()
        return ({data:res} as Result<any>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:undefined, error:err} as Result<any>))
    )
  }
  
  private getBranches():Subscription{
    return this.http.get<Branch[]>(`${this.baseUrl}/apps/branch`,this.httpOptions).pipe(
      map(res=>({data:res} as Result<Branch[]>)),
      catchError((err:HttpErrorResponse) =>of({data:[], error:err} as Result<Branch[]>))
    ).subscribe(res=>{
      this.branchesSub.next(res.data),
      this.brancheserrSub.next(res.error)
    })
  }

  fetch(){
    this.getBranches()
  }

  private branchesSub:BehaviorSubject<Branch[] | null> = new BehaviorSubject<Branch[] | null>(null)
  private brancheserrSub:BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null)
  branches$:Observable<Branch[] | null> = this.branchesSub.asObservable()
  branchesErr$:Observable<HttpErrorResponse | null> = this.brancheserrSub.asObservable()
}
