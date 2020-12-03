import { Component, Input } from '@angular/core'
import { IResume } from '../../../services/resume.service'

@Component({ template: '' })
export abstract class Section {
  @Input() public resume: IResume
}