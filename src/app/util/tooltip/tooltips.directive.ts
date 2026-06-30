import { Directive , ElementRef, HostListener, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[appTooltips]',
  providers: [MatTooltip],
  
})
export class TooltipsDirective {
  constructor(private elementRef: ElementRef) {}
  ngAfterViewInit(): void {
    setTimeout(() => {
      const element = this.elementRef.nativeElement;
      if(element.offsetWidth < element.scrollWidth){
        element.title = element.innerHTML;
      }
    }, 500);
  }
}
