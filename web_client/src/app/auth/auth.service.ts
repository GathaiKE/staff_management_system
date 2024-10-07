import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { User, UserFormData } from '../dashboard/interfaces/interfaces';
import { BehaviorSubject, catchError, map, Observable, of, Subject, Subscription } from 'rxjs';
import { LoginResponse } from './authInterfaces';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Result } from '../utilities/utilities';
import { Router } from '@angular/router';
import { DynamicComponentsService } from '../utilities/components/dynamic-components/dynamic-components.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl:string = environment.BASE_URL
  private tokenSub!:BehaviorSubject<string | null>
  private userSub!:BehaviorSubject<string | null> 
  token$!:Observable<string | null>
  user$!:Observable<string | null> 
  
  
  
    constructor(
      private http:HttpClient,
      private router:Router,
      private dynamicComponentService:DynamicComponentsService
      ) {
        let token;
        let user;

        if(localStorage &&  typeof localStorage?.getItem('user') === 'string'){
          token = localStorage?.getItem('user')
        }

        if(typeof localStorage?.getItem('token') === 'string'){
          token = localStorage?.getItem('token')
        }

        this.tokenSub = new BehaviorSubject<string | null>(token?token:null)
        this.userSub  = new BehaviorSubject<string | null>(user?user:null)
        this.user$ = this.userSub.asObservable()
        this.token$ = this.tokenSub.asObservable()
      }
  
    login(user:UserFormData):Subscription{
      return this.http.post<LoginResponse>(`${this.baseUrl}/api/login/`, user).pipe(
        map(res=>({data:res, error:{}} as Result<LoginResponse>)),
        catchError(res=>of({data:{}, error:res} as Result<LoginResponse>))
      ).subscribe(res=>{
        if(res.data.token){
          localStorage.setItem("token", res.data.token)
          localStorage.setItem("user", res.data.user.id)
          this.currentUserSub.next(res.data.user)
          this.userSub.next(res.data.user.id)
          this.tokenSub.next(res.data.token)
          if(res.data.user.is_superuser || res.data.user.is_assistant_superadmin){
            this.router.navigate(['attendance'])
          } else if(res.data.user.is_organizationadmin || res.data.user.is_branchadmin || res.data.user.is_buildingadmin){
            this.router.navigate(['attendance'])
          } else{
            this.router.navigate(['profile'])
          }
          this.dynamicComponentService.loadFeedback("Log In Successfull", {duration:1500, action:{abort:"close"}})
        } else{
          const error =res.error.error
          if(error.email){
            this.dynamicComponentService.loadFeedback(`Login Failed: ${error.email}`, {duration:1500, action:{abort:"close"}})
          } else if(error.error){
            this.dynamicComponentService.loadFeedback(`Login Failed: ${error.error}`, {duration:1500, action:{abort:"close"}})
          } else if(error.loaded === 0){
            console.log("Error:",error)
            this.dynamicComponentService.loadFeedback(`Error connecting to server`, {duration:1500, action:{abort:"close"}})
          } else{
            console.log("Error:",error)
            this.dynamicComponentService.loadFeedback(`Error connecting to server`, {duration:1500, action:{abort:"close"}})
          }
        }
      })
    }

    activeUser():Subscription{
      return this.token$.subscribe(token=>{
        const headers = new HttpHeaders({
          'Content-Type':'application/json',
          'Authorization':`Token ${token}`
        })

        this.http.get<User>(`${this.baseUrl}/api/user/${ localStorage.getItem('user')}`, {headers}).pipe(
          map(res=>({data:res} as Result<User>)),
          catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<User>))
        ).subscribe(res=>{
          this.currentUserSub.next(res.data)
          this.loginErrorSub.next(res.error)
        })
      })
    }

    logOut(){
      localStorage.clear()
      this.userSub.next(null)
      this.tokenSub.next(null)
      this.currentUserSub.next(null)
      this.router.navigate([''])
    }


  private currentUserSub:BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null)
  private loginErrorSub:Subject<HttpErrorResponse> = new Subject<HttpErrorResponse>()
  currentUser$:Observable<User | null> = this.currentUserSub.asObservable()
  logInError$:Observable<HttpErrorResponse> = this.loginErrorSub.asObservable()
}
