import { Component, OnInit } from '@angular/core'
import { Theme } from '../../../enums/Theme.enum'
import { IResume } from '../../../services/resume.service'
import { UserService } from '../../../services/user.service'

@Component({
  selector: 'app-basic-theme',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})
export class BasicThemeComponent implements OnInit {

  public resume?: IResume
  public theme: Theme = Theme.Basic

  public constructor(private readonly userService: UserService) { }

  public ngOnInit() {
    this.resume = this.userService.resume
  }

}
