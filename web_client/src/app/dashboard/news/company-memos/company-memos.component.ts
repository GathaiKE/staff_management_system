import { Component, TemplateRef } from '@angular/core';
import { NewPost, NewsFormData, Publication, UpdatedPost, User, UserFormData } from '../../interfaces/interfaces';
import { DynamicComponentsService } from '../../../utilities/components/dynamic-components/dynamic-components.service';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewsService } from '../../services/news/news.service';
import { AuthService } from '../../../auth/auth.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-company-memos',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor, NgIf, DatePipe, NewsDetailComponent, PaginatorComponent, SpinnerComponent],
  templateUrl: './company-memos.component.html',
  styleUrl: './company-memos.component.css'
})
export class CompanyMemosComponent {
  memos!:Publication[]
  showPopup:boolean = false
  submit!:string
  abort!:string
  size!:string
  memo!:Publication
  isAllowedToEdit:boolean = false
  user!:User
  searchString:string = ''
  displayedData:Publication[] = []
  pageSize:number =1
  totalPages:number =1
  currentPage:number = 1
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
    this.memo = post
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
      this.memos = res?.filter(i=>i.message_type === 'memo') as Publication[]
      this.pageSize = 10
      this.totalPages = (Math.ceil((this.memos?.length)/this.pageSize))
      this.currentPage = 1
      this.showPag = this.totalPages > 1?true:false
      this.showSpinner = false
      this.updateDisplay()
    })
  }

  sendMemo(){
    this.showPopup = false
    this.dynamicComponentSevice.loadForm({activeForm:"newMemo",size:'fit', title:'News Release', action:{abort:'Cancel', submit:'Publish'}}).subscribe((res:NewsFormData)=>{
      const payload:NewPost = {
        body:res.body,
        file_uploaded:res.image,
        message_title:res.title,
        message_type:'memo',
        user:this.user.id
      }

      this.newsService.postPublicatipn(payload).subscribe(res=>{
        if(res.data.id){
          this.dynamicComponentSevice.loadFeedback("Memo sent successfully", {duration:1000})
        } else{
          this.dynamicComponentSevice.loadFeedback("Error sending this memo", {duration:1000})
        }
      })
    })
  }

  updateMemo(post:Publication, event:Event){
    event.stopPropagation()
    this.dynamicComponentSevice.loadForm({activeForm:"updateMemo",size:'fit', title:'Update Memo', action:{abort:'Cancel', submit:'Update'}, data:{post:post}}).subscribe(res=>{
      const payload:UpdatedPost = {
        body:res.body,
        file_uploaded:null,
        message_title:res.title,
        message_type:'memo'
      }

      this.newsService.updatePublicatipn(post.id,payload).subscribe(res=>{
        if(res.data.id){
          this.dynamicComponentSevice.loadFeedback("Update successful", {duration:1000})
        } else{
          this.dynamicComponentSevice.loadFeedback("Error updating this Memo", {duration:1000})
        }
      })
  })

  this.showPopup = false
  }

  filter() {
    this.newsService.getNews()
    this.newsService.newsAndMemos$.subscribe(res=>{
      this.memos = res?.filter(i=>i.message_type === 'memo') as Publication[]
      const comms:Publication[] = res?.filter(i=>i.message_type === 'memo') as Publication[]
      const data:Publication[] = comms.filter(i=>{
        let str: string = this.searchString.toLowerCase().trim()
        return (i.message_title.toLowerCase().trim().includes(str))
      })
      this.memos = data
      this.updateDisplay()
    })

  }
  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.memos?.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }

}
