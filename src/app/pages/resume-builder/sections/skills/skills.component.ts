import { Component, QueryList, ViewChildren } from '@angular/core'
import { timer } from 'rxjs'
import { InputComponent } from '../../../../ui/input/input.component'
import { Section } from '../section'

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent extends Section {

  @ViewChildren('skillName')
  public skillNames: QueryList<InputComponent>

  public addSkill() {
    this.resume.skills.push({
      name: '',
      proficiency: '',
      years: ''
    })
    timer(100).subscribe(() => this.skillNames.last.setFocus())
  }

}
