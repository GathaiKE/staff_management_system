import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx'
import { CheckInData } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToExcel(data: CheckInData[], filename: string): void {
    
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.transformData(data));
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, filename);
  }


  transformData(data: CheckInData[]): any[] {
    return data.map(item => ({
      'Staff Number': item.user.staff_number,
      'First Name': item.user.first_name,
      'Middle Name':item.user.middle_name,
      'Last Name':item.user.last_name,
      'Department':item.user.staff_department,
      'Branch': item.user.user_organization.branch.name,
      'Check-In Date': this.transformTime(item.checkin_time),
      'Check Out':item.checkout_time?this.transformTime(item.checkout_time):'',
      'Status':item.user.is_checked_in?"IN":"OUT"
    }));
  }

  transformTime(timeString: string): string {
    const date = new Date(timeString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const secondsStr = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
  }
}
