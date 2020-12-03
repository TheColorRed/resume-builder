import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'toDate'
})
export class ToDatePipe implements PipeTransform {

  transform(value: string): Date | unknown {
    if (!value) return value
    const split = value.split('-')
    const [year, month, day] = split
    if (split.length === 2) return new Date(parseInt(year), parseInt(month) - 1)
    return new Date(`${value}`)
  }

}
