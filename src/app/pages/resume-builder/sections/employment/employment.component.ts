import { Component } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { DeleteDialogComponent } from '../../../../ui/delete-dialog/delete-dialog.component'
import { Section } from '../section'

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.scss']
})
export class EmploymentComponent extends Section {

  public constructor(
    private readonly dialog: MatDialog
  ) {
    super()
  }

  public deleteJob(index: number) {
    if (this.resume.jobs[index]) {
      const company = this.resume.jobs[index].company || 'Unknown'
      this.dialog
        .open<DeleteDialogComponent, string, boolean>(DeleteDialogComponent, {
          data: `Are you sure you want to remove the company <b>${company}</b> from your resume?`
        })
        .afterClosed()
        .subscribe(shouldDelete => {
          if (shouldDelete) {
            this.resume.jobs.splice(index, 1)
          }
        })
    }
  }

  public deleteContact(job: number, contact: number) {
    if (this.resume.jobs[job] && this.resume.jobs[job].contacts[contact]) {
      const company = this.resume.jobs[job].company || 'Unknown'
      const cont = this.resume.jobs[job].contacts[contact].name || 'this contact'
      this.dialog
        .open<DeleteDialogComponent, string, boolean>(DeleteDialogComponent, {
          data: `Are you sure you want to remove <b>${cont}</b> as a contact from the company <b>${company}</b>?`
        })
        .afterClosed()
        .subscribe(shouldDelete => {
          if (shouldDelete) {
            this.resume.jobs[job].contacts.splice(contact, 1)
          }
        })
    }
  }

  public addContact(job: number) {
    if (this.resume.jobs[job]) {
      if (!this.resume.jobs[job].contacts) this.resume.jobs[job].contacts = []
      this.resume.jobs[job].contacts.push({
        email: '', name: '', phone: '', fax: ''
      })
    }
  }
}
