import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthGuard } from './guards/auth.guard'
import { ResumeBuilderComponent } from './pages/resume-builder/resume-builder.component'
import { WelcomeComponent } from './pages/welcome/welcome.component'

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'resume-builder', canActivate: [AuthGuard], component: ResumeBuilderComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
