import { Injectable } from '@angular/core'
import { UserService } from './user.service'

@Injectable({
  providedIn: 'root'
})
export class InitService {

  constructor(
    private readonly userService: UserService
  ) { }

  public async init() {
    return await this.userService.init()
  }
}
