import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '?';
    return value.split(' ').map(w => w[0]).join('').toUpperCase();
  }
}
