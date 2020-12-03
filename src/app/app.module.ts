import { HttpClientModule } from '@angular/common/http'
import { APP_INITIALIZER, NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatStepperModule } from '@angular/material/stepper'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BasicThemeComponent } from './components/themes/basic/basic.component'
import { JobsComponent } from './components/themes/sections/jobs/jobs.component'
import { ResumeBuilderComponent } from './pages/resume-builder/resume-builder.component'
import { BasicInformationComponent } from './pages/resume-builder/sections/basic-information/basic-information.component'
import { EducationComponent } from './pages/resume-builder/sections/education/education.component'
import { EmploymentComponent } from './pages/resume-builder/sections/employment/employment.component'
import { WelcomeComponent } from './pages/welcome/welcome.component'
import { PhonePipe } from './pipes/phone.pipe'
import { ToDatePipe } from './pipes/to-date.pipe'
import { InitService } from './services/init.service'
import { InputComponent } from './ui/input/input.component'
import { SelectComponent } from './ui/select/select.component'
import { TextareaComponent } from './ui/textarea/textarea.component';
import { DeleteDialogComponent } from './ui/delete-dialog/delete-dialog.component';
import { SkillsComponent } from './pages/resume-builder/sections/skills/skills.component';
import { RatingComponent } from './ui/rating/rating.component'

export const materialModules = [
  MatButtonModule,
  MatButtonToggleModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatInputModule,
  MatSelectModule,
  MatTabsModule,
  MatSnackBarModule,
  MatStepperModule,
  MatDialogModule
]

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    ResumeBuilderComponent,
    BasicThemeComponent,
    JobsComponent,
    InputComponent,
    PhonePipe,
    SelectComponent,
    BasicInformationComponent,
    EducationComponent,
    EmploymentComponent,
    TextareaComponent,
    ToDatePipe,
    DeleteDialogComponent,
    SkillsComponent,
    RatingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ...materialModules,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (appInit: InitService) => async () => { await appInit.init() },
      deps: [InitService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
