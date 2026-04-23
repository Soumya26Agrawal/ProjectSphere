import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration', standalone: true })
export class DurationPipe implements PipeTransform {
  transform(start: string, end: string): string {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
    return days + 'd';
  }
}
