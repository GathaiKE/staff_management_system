import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Inject, Injectable, Injector } from '@angular/core';
import { Form } from '../../utilities';
import { InputFormComponent } from './input-form/input-form.component';
import { Subject, take, timer } from 'rxjs';
import { FeedbackComponent } from './feedback/feedback.component';
import { FormGroup } from '@angular/forms';
import { DeleteComponent } from './delete/delete.component';

@Injectable({
  providedIn: 'root'
})
export class DynamicComponentsService {
  private inputComponentNotifier:Subject<any> = new Subject<any>
  private feedbackComponentNotifier:Subject<any> = new Subject<any>
  private confirmActionNotifier:Subject<any> = new Subject<any>


  constructor(
    private resolver:ComponentFactoryResolver, 
    private injector:Injector,
    @Inject(DOCUMENT) private document:Document,
    private appRef:ApplicationRef
  ) { }


  loadForm(options?:Form){
    const inputComponentFactory = this.resolver.resolveComponentFactory(InputFormComponent)
    const inputComponent = inputComponentFactory.create(this.injector)
    inputComponent.instance.size = options?.size
    inputComponent.instance.title = options?.title
    inputComponent.instance.activeForm = options?.activeForm
    inputComponent.instance.data = options?.data
    inputComponent.instance.action = {abort:options?.action?.abort, submit:options?.action?.submit}
    inputComponent.instance.abortEvent.subscribe(()=>this.closeInputFormComponent())
    inputComponent.instance.submitEvent.subscribe(formData=>this.submitInputFormComponent(formData))
    inputComponent.hostView.detectChanges()
    this.document.body.appendChild(inputComponent.location.nativeElement)
    

    return this.inputComponentNotifier.asObservable()
  }

  submitInputFormComponent(formData:FormGroup<any>){
    this.inputComponentNotifier?.next(formData)
    this.closeInputFormComponent()
  }

  closeInputFormComponent(){
    this.inputComponentNotifier?.complete()
  }

  loadFeedback(message:string, options:{duration:number, action?:{abort?:string, submit?:string}}){
    const feedbackComponentFactory = this.resolver.resolveComponentFactory(FeedbackComponent)
    const feedbackComponent:ComponentRef<FeedbackComponent> = feedbackComponentFactory.create(this.injector)
    const viewRef = feedbackComponent.hostView
    feedbackComponent.instance.abort = options.action?.abort
    feedbackComponent.instance.duration = options.duration
    feedbackComponent.instance.message = message

    if(options?.duration){
      timer(options.duration).pipe(take(1)).subscribe(()=>this.closeFeedbackComponent(feedbackComponent))
    }
    feedbackComponent.instance.abortEvent.subscribe(()=>this.closeFeedbackComponent(feedbackComponent))
    this.appRef.attachView(viewRef)
    this.document.body.appendChild(feedbackComponent.location.nativeElement)

    return this.feedbackComponentNotifier.asObservable()
  }

  confirmAction(message:string, options:{action?:{abort?:string, submit?:string}}){
    const confirmActionComponentFactory = this.resolver.resolveComponentFactory(DeleteComponent)
    const confirmActionComponent:ComponentRef<DeleteComponent> = confirmActionComponentFactory.create(this.injector)
    const viewRef = confirmActionComponent.hostView
    confirmActionComponent.instance.action = {
      abort:options.action?.abort,
      submit:options.action?.submit
    }
    confirmActionComponent.instance.message = message
    confirmActionComponent.instance.abortEvent.subscribe(()=>this.confirmActionNotifier.complete())
    confirmActionComponent.instance.submitEvent.subscribe((res)=>this.submitConfirmAction(res))
    this.appRef.attachView(viewRef)
    this.document.body.appendChild(confirmActionComponent.location.nativeElement)

    return this.confirmActionNotifier.asObservable()
  }

  submitConfirmAction(action:string){
    this.confirmActionNotifier.next(action)
    this.closeConfirmAction()
  }

  closeConfirmAction(){
    this.confirmActionNotifier.complete()
  }


  private closeFeedbackComponent(feedbackComponent: ComponentRef<FeedbackComponent>) {
    this.appRef.detachView(feedbackComponent.hostView);
    feedbackComponent.destroy();
    this.feedbackComponentNotifier.next(null);
    this.feedbackComponentNotifier.complete();
    this.feedbackComponentNotifier = new Subject<void>();
  }
}
