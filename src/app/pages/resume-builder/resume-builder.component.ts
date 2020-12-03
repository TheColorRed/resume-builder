import { StepperSelectionEvent } from '@angular/cdk/stepper'
import { TitleCasePipe } from '@angular/common'
import { Component, OnInit, ViewChild } from '@angular/core'
import { MatButtonToggleChange } from '@angular/material/button-toggle'
import { MatHorizontalStepper } from '@angular/material/stepper'
import { ActivatedRoute, Router } from '@angular/router'
import { timer } from 'rxjs'
import { Degree } from '../../enums/Degree.enum'
import { Theme } from '../../enums/Theme.enum'
import { IResume } from '../../services/resume.service'
import { UserService } from '../../services/user.service'
import { SkillsComponent } from './sections/skills/skills.component'

@Component({
  selector: 'app-resume-builder',
  templateUrl: './resume-builder.component.html',
  styleUrls: ['./resume-builder.component.scss'],
  providers: [TitleCasePipe]
})
export class ResumeBuilderComponent implements OnInit {

  public themes = Object.values(Theme).map(val => ({
    key: val,
    label: this.titlePipe.transform(val)
  }))

  public theme: Theme = Theme.Basic
  public Theme: typeof Theme = Theme
  public resume: IResume

  @ViewChild('stepper', { static: true })
  private stepper: MatHorizontalStepper

  @ViewChild('skills')
  private skills: SkillsComponent

  public constructor(
    private readonly userService: UserService,
    private readonly titlePipe: TitleCasePipe,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  public ngOnInit() {
    this.resume = this.userService.resume
    this.theme = this.userService.resumeTheme
    timer(10).subscribe(() => {
      this.activatedRoute.queryParams.subscribe(params => {
        this.stepper.selectedIndex = parseInt(params.step || 0)
      })
    })
  }

  public setTheme(theme: MatButtonToggleChange) {
    this.theme = theme.value
    this.userService.resumeTheme = this.theme
  }

  public stepChanged(step: StepperSelectionEvent) {
    this.router.navigate(['resume-builder'], {
      queryParams: {
        step: step.selectedIndex
      }
    })
  }

  public addEducation() {
    if (!this.resume.education) this.resume.education = []
    this.resume.education.push({
      degree: Degree.None, major: '', end: null, start: null, school: ''
    })
  }

  public addEmployment() {
    if (!this.resume.jobs) this.resume.jobs = []
    this.resume.jobs.push({
      company: '',
      contacts: [],
      duties: [],
      end: null,
      start: null,
      jobTitle: '',
      description: ''
    })
  }

  public addSkill() {
    if (!this.resume.skills) this.resume.skills = []
    this.skills.addSkill()
  }

  public save() {
    this.userService.saveResume()
  }

  public print() {

  }

}
