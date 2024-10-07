import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'short',
  standalone: true
})
export class ShortPipe implements PipeTransform {

  transform(value: string,shorten:boolean = true, ...args: unknown[]): string {
    if (!value) {
      return '';
    }

    if (!shorten) {
      return value;
    }
    
    const words = value.split(' ');
    if (words.length <= 15) {
      return value;
    }
    
    const truncated = words.slice(0, 15).join(' ');
    return `${truncated}...`;
  }

}
