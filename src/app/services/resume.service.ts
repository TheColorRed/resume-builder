import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { Degree } from '../enums/Degree.enum'
import { Theme } from '../enums/Theme.enum'
import { QueryBuilderService } from './graphql/query-builder.service'

export interface IResume {
  name: string
  contact: IContact
  tagLine: string
  jobs: IJob[]
  education: IEducation[]
  skills: ISkill[]
  portfolio: IPortfolio[]
}

export interface IJob {
  company: string
  jobTitle: string
  description?: string
  duties: string[]
  start: string
  end: string
  contacts: IContact[]
}

export interface ISkill {
  name: string
  years: string
  proficiency: string
}

export interface IPortfolio {
  website: string
}

export interface IEducation {
  school: string
  degree: Degree
  major: string
  start: string
  end: string
}

export interface IContact {
  name: string
  email: string
  phone: string
  fax: string
}

export interface ISaveResult {
  owner: number
  resume: IResume
  theme: string
  updated_at: Date
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor(
    private readonly queryBuilder: QueryBuilderService
  ) { }

  public getResume(userId: number) {
    const sub = new Subject<{ resume: IResume, theme: string }>()
    const subscription = this.queryBuilder
      .table('resumes')
      .select('resume, theme')
      .primary({ owner: userId })
      .first<{ resume: IResume, theme: string }>()
      .subscribe(result => {
        sub.next({
          theme: result.theme,
          resume: {
            ...result.resume,
            // jobs: result.resume.jobs.map(i => {
            //   return {
            //     ...i,
            //     start: i.start ? new Date(`${i.start}`) : undefined,
            //     end: i.end ? new Date(`${i.end}`) : undefined
            //   }
            // })
          }
        })
        subscription.unsubscribe()
      })
    return sub.asObservable()
  }

  public saveResume(userId: number, resume: IResume, theme: Theme = Theme.Basic) {
    const sub = new Subject<ISaveResult>()
    // Remove array items that are not properly filled out
    // TODO: Use a validator
    resume.skills = resume.skills.filter(i => i.name)
    resume.jobs = resume.jobs.filter(i => i.company)
    resume.education = resume.education.filter(i => i.school)

    const subscription = this.queryBuilder
      .table('resumes')
      .select('owner, resume, theme, updated_at')
      .upsert('resumes_pkey', {
        owner: userId,
        resume, theme
      }, ['resume', 'theme'])
      .mutate<ISaveResult>()
      .subscribe(result => {
        sub.next({
          ...result,
          updated_at: new Date(`${result.updated_at}Z`)
        })
        subscription.unsubscribe()
      })
    return sub.asObservable()
  }

}
