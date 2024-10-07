import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../utilities/components/header/header.component';
import { SidenavComponent } from '../../utilities/components/sidenav/sidenav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicComponentsService } from '../../utilities/components/dynamic-components/dynamic-components.service';
import { AuthService } from '../../auth/auth.service';
import { Publication, User } from '../interfaces/interfaces';
import { StaffService } from '../services/staff/staff.service';
import { NewsService } from '../services/news/news.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidenavComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user!:User
  showPopup:boolean = false
  submit!:string
  abort!:string
  size!:string
  posts!:Publication[]
  isAllowedToEdit:boolean = false
  
  constructor(
    private router:Router, 
    private dynamicComponentService:DynamicComponentsService,
    private authService:AuthService,
    private newsService:NewsService
  ){}

  ngOnInit(): void {
    this.authService.activeUser()
    this.authService.currentUser$.subscribe(res=>{
      if(res){
        this.user = res
      }
      
    })
    this.router.navigate(['profile/news/memos'])
}



  updateUserInfo(){
    const id:string = localStorage.getItem("user")?localStorage.getItem("user") as string:''
    this.dynamicComponentService.loadForm({activeForm:"updateUser",size:'fit', title:'Update Profile', duration:'2500',action:{abort:'Cancel', submit:'Update'}, data:{id:id}}).subscribe(res=>console.log(res))
  }

  changePassword(){
    this.router.navigate(['new-password'])
  }

  activeRoute(route:string){
    return this.router.isActive(route, true)
  }
  
  navigate(route:string){
    this.router.navigate([route])
  }
}


// news!:Publication[]
//   showPopup:boolean = false
//   submit!:string
//   abort!:string
//   size!:string
//   post!:Publication
//   isAllowedToEdit:boolean = false
//   user!:User
//   // imageInsertText: 'Add'|'Change' = 'Add'
//   constructor(
//     private dynamicComponentSevice:DynamicComponentsService,
//     private newsService:NewsService,
//     private authService:AuthService
  
//   ){}

//   ngOnInit(): void {
//     this.fetchPosts()
//   }

//   getResponse(event:any){
//     console.log("Event", event);
//     this.closePopup()
    
//   }

//   openPopup(post:Publication){
//     this.showPopup = true
//     this.submit = 'Update'
//     this.post = post
//     this.isAllowedToEdit= f closePopup(){
//     this.showPopup = false
//   }

//   fetchPosts(){
//     this.authService.activeUser()
//     this.authService.currentUser$.subscribe(user=>this.user = user as User)
//     this.newsService.getNews()
//     this.newsService.newsAndMemos$.subscribe(res=>{
//       this.news = res?.filter(i=>i.message_type === 'news') as Publication[]
//     })
//   }alse
//     this.abort = 'Close'
//     this.size = '10/12'
//   }

//   closePopup(){
//     this.showPopup = false
//   }

//   fetchPosts(){
//     this.authService.activeUser()
//     this.authService.currentUser$.subscribe(user=>this.user = user as User)
//     this.newsService.getNews()
//     this.newsService.newsAndMemos$.subscribe(res=>{
//       this.news = res?.filter(i=>i.message_type === 'news') as Publication[]
//     })
//   }

//   addNews(){
//     this.showPopup = false
//     this.dynamicComponentSevice.loadForm({activeForm:"newRelease",size:'fit', title:'News Release', action:{abort:'Cancel', submit:'Publish'}}).subscribe((res:NewsFormData)=>{
//       const payload:NewPost = {
//         body:res.body,
//         file_uploaded:res.image,
//         message_title:res.title,
//         message_type:'news',
//         user:this.user.id
//       }

//       this.newsService.postPublicatipn(payload).subscribe(res=>{
//         if(res.data.id){
//           this.dynamicComponentSevice.loadFeedback("Publication posted successfully", {duration:1000})
//         } else{
//           this.dynamicComponentSevice.loadFeedback("Error publishing this release", {duration:1000})
//         }
//       })
//     })
//   }

//   updateNews(post:Publication, event:Event){
//     event.stopPropagation()
//     this.dynamicComponentSevice.loadForm({activeForm:"updatePublication",size:'fit', title:'UpdatePublication', action:{abort:'Cancel', submit:'Update'}, data:{post:post}}).subscribe(res=>{
//       const payload:UpdatedPost = {
//         body:res.body,
//         file_uploaded:res.image,
//         message_title:res.title,
//         message_type:'news'
//       }

//       this.newsService.updatePublicatipn(post.id,payload).subscribe(res=>{
//         if(res.data.id){
//           this.dynamicComponentSevice.loadFeedback("Update successful", {duration:1000})
//         } else{
//           this.dynamicComponentSevice.loadFeedback("Error updating this publication", {duration:1000})
//         }
//       })
//   })
//   }