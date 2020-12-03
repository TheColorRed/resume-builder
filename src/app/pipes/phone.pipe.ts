import { Pipe, PipeTransform } from '@angular/core'

type FormatType = 'separator' | 'standard' | 'period' | 'dash'

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  transform(value: string, type: FormatType, sep?: string): unknown {
    return value
      .replace(/[^\d]/g, '')
      .replace(/(\d{3})(\d{3})(\d{4})/, (...[, g1, g2, g3]) => {
        switch (type) {
          case 'period': return `${g1}.${g2}.${g3}`
          case 'dash': return `${g1}-${g2}-${g3}`
          case 'separator': return `${g1}${sep}${g2}${sep}${g3}`
          case 'standard':
          default:
            return `(${g1}) ${g2}-${g3}`
        }
      })
  }

}
