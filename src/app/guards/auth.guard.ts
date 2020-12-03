import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router'

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  public constructor(private readonly router: Router) { }
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // if(!loggedIn) return this.router.navigateByUrl('/login')
    return true
  }
}