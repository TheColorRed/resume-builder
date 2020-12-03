import { Component } from '@angular/core'
import { UserService } from '../../services/user.service'

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  public constructor(public readonly user: UserService) { }

}
