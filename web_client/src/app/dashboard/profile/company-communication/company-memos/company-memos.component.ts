import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';
import { Publication, User } from '../../../interfaces/interfaces';
import { NewsService } from '../../../services/news/news.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ShortPipe } from '../../../../utilities/pipes/short.pipe';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-company-memos',
  standalone: true,
  imports: [NgFor, DatePipe, ShortPipe, NgClass, NgIf, PaginatorComponent, SpinnerComponent],
  templateUrl: './company-memos.component.html',
  styleUrl: './company-memos.component.css'
})
export class CompanyMemosComponent implements OnInit{
user!:User
memos!:Publication[]
shorten!:{[key:string]:boolean}
showText!:'Expand' | 'Collapse'
noRecords:string= 'No Posts to display'
currentPage: number = 1
totalPages: number = 1
pageSize: number = 10
displayedData: Publication[] = []
searchString:string = ''
showPag:boolean = false
showSpinner:boolean = false


constructor(private authService:AuthService, private newsService:NewsService){}
  ngOnInit(): void {
      this.authService.activeUser()
      this.authService.currentUser$.subscribe(res=>{
        if(res){
          this.user = res
        }
      })
      this.fetchPosts()
  }
  
    toggleContent(id:string){
      this.shorten[id] = !this.shorten[id]
      switch(this.showText){
        case 'Collapse':
          this.showText = 'Expand'
          break;
        case 'Expand':
          this.showText = 'Collapse'
          break;
        default:
        this.showText = 'Expand'
        break;
      }
    }
  
    fetchPosts(){
      this.showSpinner = true
      this.authService.activeUser()
      this.authService.currentUser$.subscribe(user=>this.user = user as User)
      this.newsService.getNews()
      this.newsService.newsAndMemos$.subscribe(res=>{
        this.memos = res?.filter(i=>i.message_type === 'memo') as Publication[]
        this.memos?.forEach(post => this.shorten[post.id] = true)
        this.pageSize = 10
        this.totalPages = (Math.ceil((this.memos?.length)/this.pageSize))
        this.currentPage = 1
        this.showPag = this.totalPages > 1?true:false
        this.showSpinner = false
        this.updateDisplay()
      })
      this.shorten = {}
      this.showText = 'Expand'
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
