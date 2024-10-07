import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../../services/news/news.service';
import { AuthService } from '../../../../auth/auth.service';
import { Publication, User } from '../../../interfaces/interfaces';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { NewsDetailComponent } from '../../../news/news-detail/news-detail.component';
import { ShortPipe } from '../../../../utilities/pipes/short.pipe';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-company-news',
  standalone: true,
  imports: [NgIf, NgFor, NewsDetailComponent, DatePipe, ShortPipe, PaginatorComponent, SpinnerComponent],
  templateUrl: './company-news.component.html',
  styleUrl: './company-news.component.css'
})
export class CompanyNewsComponent implements OnInit{
showPopup:boolean = false
posts!:Publication[]
user!:User
isAllowedToEdit!:boolean
post!:Publication
size!:string
noRecords:string= 'No Posts to display'
currentPage: number = 1
totalPages: number = 1
pageSize: number = 10
displayedData: Publication[] = []
searchString:string = ''
showPag:boolean = false
showSpinner:boolean = false


constructor(
  private newsService:NewsService,
  private authService:AuthService
){}

ngOnInit(): void {
  this.fetchPosts()
}

  closePopup(){
    this.showPopup = false
  }

  openPopup(post:Publication){
    this.showPopup = true
    this.post = post
    this.isAllowedToEdit= false
    this.size = '10/12'
  }

  fetchPosts(){
    this.showSpinner = true
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(user=>this.user = user as User)
    this.newsService.getNews()
    this.newsService.newsAndMemos$.subscribe(res=>{
      this.posts = res?.filter(i=>i.message_type === 'news') as Publication[]
      this.pageSize = 10
      this.totalPages = (Math.ceil((this.posts?.length)/this.pageSize))
      this.currentPage = 1
      this.showPag = this.totalPages > 1?true:false
      this.showSpinner = false
      this.updateDisplay()
    })
  }


  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.posts?.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
