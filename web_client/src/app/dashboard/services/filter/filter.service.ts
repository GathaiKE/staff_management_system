import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CheckInData } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() { }
//  Attendance filter
  attendanceFilterSub:Subject<CheckInData[]> = new Subject<CheckInData[]>()
  attendanceData$:Observable<CheckInData[]> = this.attendanceFilterSub.asObservable()
}
