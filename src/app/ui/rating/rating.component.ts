import { Component, forwardRef, Input } from '@angular/core'
import { NG_VALUE_ACCESSOR } from '@angular/forms'
import { Accessor } from '../../classes/accessor'

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ]
})
export class RatingComponent extends Accessor {

  public maxArr = []

  private _min = 0
  private _max = 1

  @Input() public set min(value: number) { this._min = value }
  @Input() public set max(value: number) {
    this._max = value
    this.maxArr = Array(value).fill(0).map((i, idx) => idx)
  }

  public get min() { return this._min }
  public get max() { return this._max }

  public rate(value: number) {
    this.value = value
  }
}
