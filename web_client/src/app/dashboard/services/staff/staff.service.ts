import { Injectable, OnInit } from '@angular/core';
import { env } from 'process';
import { environment } from '../../../../environment/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  CheckInData,
  NewAdmin,
  NewStaff,
  User,
} from '../../interfaces/interfaces';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  catchError,
  map,
  of,
} from 'rxjs';
import { Result } from '../../../utilities/utilities';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private baseUrl: string = environment.BASE_URL;
  private token?: string | undefined =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('token') as string | undefined)
      : undefined;

  activeUser!: User;
  organizationId!: string;
  branchId!: string;

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Token ${this.token}`,
  });

  httpOptions = {
    headers: this.headers,
  };

  constructor(private http: HttpClient, private authService: AuthService) {
    this.getStaff();
    this.authService.activeUser();
    this.authService.currentUser$.subscribe((user) => {
      this.activeUser = user as User;
      this.organizationId = user?.user_organization.organization.id as string;
      this.branchId = user?.user_organization.branch.id as string;
    })
  }
  ngOnInit(): void {}

  registerStaff(user: NewStaff): Observable<Result<User>> {
    return this.http
      .post<User>(`${this.baseUrl}/api/register/`, user, this.httpOptions)
      .pipe(
        map((res) => {
          this.fetchStaff();
          return { data: res } as Result<User>;
        }),
        catchError((err: HttpErrorResponse) =>
          of({ data: {}, error: err } as Result<User>)
        )
      );
  }

  private getStaff(): Subscription {
    return this.http
      .get<User[]>(`${this.baseUrl}/api/user`, this.httpOptions)
      .pipe(
        map((res) => ({ data: res } as Result<User[]>)),
        catchError((err: HttpErrorResponse) =>
          of({ data: [], error: err } as Result<User[]>)
        )
      )
      .subscribe((res) => {
        let data: User[] = res.data.map((i) => {
          let pfp: string = i.profile_pic as string;
          return {
            ...i,
            profile_pic: this.baseUrl + pfp,
          };
        });
        if(this.activeUser?.is_organizationadmin){
          data = data.filter(i=>i.user_organization?.organization.id === this.organizationId)
        } else{
          data = data.filter(i=>i.user_organization?.branch.id === this.branchId)
        }

        this.staffSub.next(data);
        this.staffErrSub.next(res.error?.error);
      });
  }

  updateUser(id: string, user: NewAdmin): Observable<Result<User>> {
    return this.http
      .put<any>(`${this.baseUrl}/api/user/${id}/`, user, this.httpOptions)
      .pipe(
        map((res) => {
          this.getStaff();
          return { data: res } as Result<User>;
        }),
        catchError((err: HttpErrorResponse) =>
          of({ data: {}, error: err } as Result<User>)
        )
      );
  }

  getCheckinData(): Subscription {
    return this.http
      .get<any>(`${this.baseUrl}/apps/staffcheckindetail`, this.httpOptions)
      .pipe(
        map((res) => ({ data: res } as Result<CheckInData[]>)),
        catchError((err: HttpErrorResponse) =>
          of({ data: [], error: err } as Result<CheckInData[]>)
        )
      )
      .subscribe((res) => {
        const data: CheckInData[] = res.data.filter(i =>{
          if(this.activeUser.is_organizationadmin){
            return i.user.user_organization?.organization?.id === this.organizationId
          } else if(this.activeUser.is_branchadmin){
            return i.user.user_organization?.branch?.id === this.branchId
          } else{
            return []
          }
        });
        this.checkinDataSub.next(data);
        this.staffErrSub.next(res?.error?.error);
      });
  }

  changePassword(data: {
    old_password: string;
    new_password: string;
  }): Observable<Result<any>> {
    return this.http
      .post<any>(`${this.baseUrl}/api/change-password`, data, this.httpOptions)
      .pipe(
        map((res) => {
          this.getStaff();
          return { data: res } as Result<any>;
        }),
        catchError((err: HttpErrorResponse) =>
          of({ data: null, error: err } as Result<any>)
        )
      );
  }

  fetchStaff(): void {
    this.getStaff();
    this.getCheckinData();
  }

  // checkin data
  private checkinDataSub: BehaviorSubject<CheckInData[]> = new BehaviorSubject<
    CheckInData[]
  >([]);
  private checkinErrSub: BehaviorSubject<string | undefined> =
    new BehaviorSubject<string | undefined>('');
  checkinData$: Observable<CheckInData[]> = this.checkinDataSub.asObservable();
  checkinErr$: Observable<string | undefined> =
    this.checkinErrSub.asObservable();

  // staff data
  private staffSub: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  private staffErrSub: BehaviorSubject<string | undefined> =
    new BehaviorSubject<string | undefined>('');
  staffData$: Observable<User[]> = this.staffSub.asObservable();
  staffFetchErr$: Observable<string | undefined> =
    this.staffErrSub.asObservable();
}
