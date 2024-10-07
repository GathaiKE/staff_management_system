import { Injectable } from '@angular/core';
import { Message, NewPost, Publication, UpdatedPost, User } from '../../interfaces/interfaces';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, Subscription } from 'rxjs';
import { Result } from '../../../utilities/utilities';
import { environment } from '../../../../environment/environment';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl:string = environment.BASE_URL
  private token?:string | undefined = typeof localStorage !== 'undefined'?localStorage.getItem("token") as string | undefined:undefined
  headers = new HttpHeaders({
    'Content-Type':'application/json',
    'Authorization':`Token ${this.token}`
  })

  httpOptions = {
    headers:this.headers
  }
  organizationId:string = ''

  constructor(private http:HttpClient, private authService:AuthService) { 
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>{
      this.organizationId = user?.user_organization.organization.id as string
    })
  }


  getNews():Subscription{
    return this.http.get<any>(`${this.baseUrl}/apps/message`, this.httpOptions).pipe(
      map(res=>({data:res} as Result<Publication[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[], error:err} as Result<Publication[]>))
    ).subscribe(res=>{
      const data:Publication[] = res.data.map(i=>{
        let img:string = i.file_uploaded?this.baseUrl+i.file_uploaded:i.file_uploaded
        return{
          ...i,
          file_uploaded:img
        }
      }).filter(item=>item.user?.user_organization?.organization.id === this.organizationId)
      this.newsAndMemosSub.next(data)
      this.newsAndMemosErrSub.next(res.error)
    })
  }

  postPublicatipn(post:NewPost):Observable<Result<Publication>>{
    const payload = new FormData()

    if(post.file_uploaded !== null){
      payload.append('file_uploaded', post.file_uploaded, post.file_uploaded.name)
    }
    payload.append('user', post.user),
    payload.append('message_title', post.message_title),
    payload.append('message_type', post.message_type),
    payload.append('body', post.body)

    const headers = new HttpHeaders({
      'Authorization':`Token ${this.token}`
    })

    return this.http.post<any>(`${this.baseUrl}/apps/message`,payload, {headers:headers}).pipe(
      map(res=>{
        this.getNews()
        return ({data:res} as Result<Publication>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<Publication>))
    )
  }

  updatePublicatipn(id:string, post:UpdatedPost):Observable<Result<Publication>>{
    const payload = new FormData()

    if(post.file_uploaded !== null){
      payload.append('file_uploaded', post.file_uploaded, post.file_uploaded.name)
    }
    payload.append('message_title', post.message_title),
    payload.append('message_type', post.message_type),
    payload.append('body', post.body)

    const headers = new HttpHeaders({
      'Authorization':`Token ${this.token}`
    })

    return this.http.put<any>(`${this.baseUrl}/apps/message/${id}/`,payload, {headers:headers}).pipe(
      map(res=>{
        this.getNews()
        return ({data:res} as Result<Publication>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:{}, error:err} as Result<Publication>))
    )
  }

 

  private newsAndMemosSub:BehaviorSubject<Publication[] | null> = new BehaviorSubject<Publication[] | null>(null)
   newsAndMemos$:Observable<Publication[] | null> = this.newsAndMemosSub.asObservable()
  private newsAndMemosErrSub:BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null)
   newsAndMemosErr$:Observable<HttpErrorResponse | null> = this.newsAndMemosErrSub.asObservable()
}
