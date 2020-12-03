import { Component, Input } from '@angular/core'
import { IJob } from '../../../../services/resume.service'

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent {

  public jobList: IJob[] = []

  @Input()
  public set jobs(value: IJob[]) {
    this.jobList = value.sort((a, b) => {
      return (new Date(b.start)?.getTime() || 0) - (new Date(a.start)?.getTime() || 0)
    })
  }

}
