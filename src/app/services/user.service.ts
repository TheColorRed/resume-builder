import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Theme } from '../enums/Theme.enum'
import { IResume, ResumeService } from './resume.service'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public resume: IResume
  public resumeTheme: Theme = Theme.Basic
  private static initialized = false

  private readonly SNACK_BAR_VERTICAL = 'top'
  private readonly SNACK_BAR_DURATION = 3000

  public get userId() {
    return parseInt(localStorage.getItem('user-id') || '0')
  }

  constructor(
    private readonly resumeService: ResumeService,
    private readonly snackBar: MatSnackBar
  ) { }

  public init() {
    return new Promise(resolve => {
      if (UserService.initialized) return resolve(true)
      UserService.initialized = true
      this.resumeService
        .getResume(this.userId)
        .subscribe(resume => {
          this.resume = {
            name: '',
            tagLine: '',
            contact: { email: '', fax: '', phone: '' },
            education: [],
            skills: [],
            jobs: [],
            portfolio: [],
            ...resume.resume
          }
          this.resumeTheme = resume.theme as Theme
          resolve(true)
        })
    })
  }

  public saveResume() {
    if (this.resume && this.userId) {
      const sub = this.resumeService
        .saveResume(this.userId, this.resume, this.resumeTheme)
        .subscribe(val => {
          const msg = typeof val === 'boolean' && !val
            ? 'Resume was not saved.'
            : 'Resume was saved!'
          this.snackBar.open(msg, 'CLOSE', {
            duration: this.SNACK_BAR_DURATION,
            verticalPosition: this.SNACK_BAR_VERTICAL
          })
          sub.unsubscribe()
        })
    }
  }
}
