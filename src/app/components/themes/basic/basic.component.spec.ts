import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BasicThemeComponent } from './basic.component'


describe('BasicComponent', () => {
  let component: BasicThemeComponent
  let fixture: ComponentFixture<BasicThemeComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasicThemeComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicThemeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
