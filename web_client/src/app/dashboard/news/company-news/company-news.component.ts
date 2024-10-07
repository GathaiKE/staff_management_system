import { Component, OnInit, TemplateRef } from '@angular/core';
import { Message, NewPost, NewsFormData, Publication, UpdatedPost, User, UserFormData } from '../../interfaces/interfaces';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewsService } from '../../services/news/news.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { AuthService } from '../../../auth/auth.service';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-company-news',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor, DatePipe, NewsDetailComponent, NgIf, PaginatorComponent, SpinnerComponent],
  templateUrl: './company-news.component.html',
  styleUrl: './company-news.component.css'
})
export class CompanyNewsComponent implements OnInit{
  news:Publication[] = []
  unfilteredPublications:Publication[] = []
  showPopup:boolean = false
  submit:string = ''
  abort:string = ''
  size:string = ''
  post!:Publication
  isAllowedToEdit:boolean = false
  user!:User
  currentPage: number = 1
  totalPages: number = 1
  pageSize: number = 10
  displayedData: Publication[] = []
  searchString:string = ''
  showPag:boolean = false
  noRecords:string= 'No Posts to display'
  showSpinner:boolean = false
  constructor(
    private dynamicComponentSevice:DynamicComponentsService,
    private newsService:NewsService,
    private authService:AuthService
  
  ){}

  ngOnInit(): void {
    this.fetchPosts()
  }

  getResponse(event:any){
    this.closePopup()
  }

  openPopup(post:Publication){
    this.showPopup = true
    this.submit = 'Update'
    this.post = post
    this.isAllowedToEdit= false
    this.abort = 'Close'
    this.size = '10/12'
  }

  closePopup(){
    this.showPopup = false
  }

  fetchPosts(){
    this.showSpinner = true
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>this.user = user as User)
    this.newsService.getNews()
    this.newsService.newsAndMemos$.subscribe(res=>{
      this.news = res?.filter(i=>i.message_type === 'news') as Publication[]
      this.pageSize = 10
      this.totalPages = (Math.ceil((this.news?.length)/this.pageSize))
      this.currentPage = 1
      this.showPag = this.totalPages > 1?true:false
      this.showSpinner = false
      this.updateDisplay()
    })
  }

  addNews(){
    this.showPopup = false
    this.dynamicComponentSevice.loadForm({activeForm:"newRelease",size:'fit', title:'News Release', action:{abort:'Cancel', submit:'Publish'}}).subscribe((res:NewsFormData)=>{
      const payload:NewPost = {
        body:res.body,
        file_uploaded:res.image,
        message_title:res.title,
        message_type:'news',
        user:this.user.id
      }

      this.newsService.postPublicatipn(payload).subscribe(res=>{
        if(res.data.id){
          this.dynamicComponentSevice.loadFeedback("Publication posted successfully", {duration:1000})
        } else{
          this.dynamicComponentSevice.loadFeedback("Error publishing this release", {duration:1000})
        }
      })
    })
  }

  updateNews(post:Publication, event:Event){
    event.stopPropagation()
    this.dynamicComponentSevice.loadForm({activeForm:"updatePublication",size:'fit', title:'UpdatePublication', action:{abort:'Cancel', submit:'Update'}, data:{post:post}}).subscribe(res=>{
      const payload:UpdatedPost = {
        body:res.body,
        file_uploaded:res.image,
        message_title:res.title,
        message_type:'news'
      }

      this.newsService.updatePublicatipn(post.id,payload).subscribe(res=>{
        if(res.data.id){
          this.dynamicComponentSevice.loadFeedback("Update successful", {duration:1000})
        } else{
          this.dynamicComponentSevice.loadFeedback("Error updating this publication", {duration:1000})
        }
      })
  })
  }

  filter() {
    this.newsService.getNews()
    this.newsService.newsAndMemos$.subscribe(res=>{
      this.news = res?.filter(i=>i.message_type === 'news') as Publication[]

      const comms:Publication[] = res?.filter(i=>i.message_type === 'news') as Publication[]
      const data:Publication[] = comms.filter(i=>{
        let str: string = this.searchString.toLowerCase().trim()
        return (i.message_title.toLowerCase().trim().includes(str))
      })
      this.news = data
      this.updateDisplay()
    })

  }
  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.news?.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }

}
