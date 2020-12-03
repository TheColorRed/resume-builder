import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { ControlValueAccessor } from '@angular/forms'

type AccessorTypes = string | number | boolean | object | undefined | null
type AccessorType = AccessorTypes | AccessorTypes[]

@Component({ template: '' })
export abstract class Accessor implements ControlValueAccessor {

  @Input() public label = ''
  @Input() public name = ''
  @Input() public disabled = false
  @Input() public required = false
  protected _value: AccessorType = ''

  @ViewChild('input', { static: true })
  private input: ElementRef<HTMLInputElement>

  public get value() {
    return this._value
  }

  public set value(value: AccessorType) {
    if (this.value === value) return
    this._value = value
    this.onChange(value)
    this.onTouched()
  }

  public onChange = (_: AccessorType) => { }
  public onTouched = () => { }

  public writeValue(obj: any) {
    if (this.value === obj) return
    this.value = obj
  }
  public registerOnChange(fn: any) {
    this.onChange = fn
  }
  public registerOnTouched(fn: any) {
    this.onTouched = fn
  }
  public setDisabledState?(isDisabled: boolean) {
    this.disabled = isDisabled
  }
  public setFocus() {
    this.input.nativeElement.focus()
  }

}