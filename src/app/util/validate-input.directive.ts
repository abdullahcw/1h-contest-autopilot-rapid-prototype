import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appValidateInput]'
})
export class ValidateInputDirective {

  constructor() {  }
  @Input('appValidateInput') appValidateInput;



  @HostListener('window: keydown', ['$event']) onkeydown(event) {
    const inputData = event.target.value + event.key;
    if (!inputData.trim().length) {
      return false;
    }
    return true;
  }

}
