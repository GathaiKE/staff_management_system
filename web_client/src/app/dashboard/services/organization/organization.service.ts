import { Injectable, OnInit } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { NewOrganization, Organization } from '../../interfaces/interfaces';
import { catchError, map, Observable, of, Subject, Subscription } from 'rxjs';
import { Result } from '../../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private baseUrl:string = environment.BASE_URL
  private token?:string | undefined = typeof localStorage !== 'undefined'?localStorage.getItem("token") as string | undefined:undefined
  headers = new HttpHeaders({
    'Content-Type':'application/json',
    'Authorization':`Token ${this.token}`
  })

  httpOptions = {
    headers:this.headers
  }

  constructor(private http:HttpClient) { }

  registerOrganization(organization:NewOrganization):Observable<Result<Organization>>{
    return this.http.post<Organization>(`${this.baseUrl}/apps/organization`, organization, this.httpOptions).pipe(
      map(res=>{
        this.getOrganizations()
        return ({data:res} as Result<Organization>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<Organization>))
    )
  }

  getOrganizations():Subscription{
    return this.http.get<Organization[]>(`${this.baseUrl}/apps/organization`,this.httpOptions).pipe(
      map(res=>({data:res} as Result<Organization[]>)),
      catchError((err:HttpErrorResponse) =>of({data:[], error:err} as Result<Organization[]>))
    ).subscribe(res=>{
      this.organizationsSub.next(res.data)
      this.organizationsErrSub.next(res.error?res.error:null)
    })
  }

  updateOrganization(organization:NewOrganization, id:string):Observable<Result<Organization>>{
    return this.http.put<any>(`${this.baseUrl}/apps/organization/${id}/`, organization, this.httpOptions).pipe(
      map(res=>{
        this.getOrganizations()
        return ({data:res}as Result<Organization>)
      }),
      catchError((err:HttpErrorResponse) => of({data:{}, error:err} as Result<Organization>))
    )
  }

  private organizationsSub:Subject<Organization[]> = new Subject<Organization[]>()
  private organizationsErrSub:Subject<HttpErrorResponse | null> = new Subject<HttpErrorResponse |null>()
  organizations$:Observable<Organization[]> = this.organizationsSub.asObservable()
  organizationsErr$:Observable<HttpErrorResponse | null >  = this.organizationsErrSub.asObservable()
}
