import { Component } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Degree } from '../../../../enums/Degree.enum'
import { DeleteDialogComponent } from '../../../../ui/delete-dialog/delete-dialog.component'
import { ISelectProps } from '../../../../ui/select/select.component'
import { Section } from '../section'

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss']
})
export class EducationComponent extends Section {

  public degrees = Object.values(Degree).map<ISelectProps>(val => {
    if (typeof val === 'string') {
      return { label: val, value: Degree[val] }
    }
    return null
  }).filter(i => i !== null)

  public constructor(
    private readonly dialog: MatDialog
  ) {
    super()
  }

  public deleteEducation(index: number) {
    if (this.resume.education[index]) {
      const school = this.resume.education[index].school || 'this school'
      this.dialog
        .open<DeleteDialogComponent, string, boolean>(DeleteDialogComponent, {
          data: `Are you sure you want to remove <b>${school}</b> from your resume?`
        })
        .afterClosed()
        .subscribe(shouldDelete => {
          if (shouldDelete) {
            this.resume.education.splice(index, 1)
          }
        })
    }
  }
}
