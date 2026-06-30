import { Directive, ElementRef, Input, AfterContentInit } from '@angular/core';
import { AnimationBuilder, AnimationPlayer, animate, style, keyframes } from '@angular/animations';


@Directive({
  selector: '[appAnimateElement]'
})


export class AnimateElementDirective implements AfterContentInit {

  playAnimation: AnimationPlayer;
  @Input() animationstyle = '';
  setAnimation: any = {};
  @Input() delay;
  @Input() duration;
  @Input() initialPosition;
  @Input() finalPosition;

  constructor(public builder: AnimationBuilder, public el: ElementRef) { }

  ngAfterContentInit() {
    this[this.animationstyle]();
  }

  easeIn() {
    this.setAnimation[this.animationstyle] = animate(this.duration, keyframes([
      style({ transform: 'translateX(' + this.initialPosition + '%)' }),
      style({ transform: 'translateX(' + this.finalPosition + '%)' }),
    ]));
    if (this.animationstyle) {
      this.destroyAnimation();
      if (this.setAnimation[this.animationstyle]) {
        this.runAnimation();
      } else {
        throw new Error(`Inavild animation  ${this.animationstyle}`);
      }
    }

  }

  easeOut() {
    this.setAnimation[this.animationstyle] = animate(this.duration, keyframes([
      style({ transform: 'translateX(' + this.finalPosition + '%)' }),
      style({ transform: 'translateX(' + this.initialPosition + '%)' }),
    ]));
    if (this.animationstyle) {
      this.destroyAnimation();
      if (this.setAnimation[this.animationstyle]) {
        this.runAnimation();
      } else {
        throw new Error(`Inavild animation  ${this.animationstyle}`);
      }
    }
  }

  runAnimation() {
    const metadata = this.setAnimation[this.animationstyle];
    const factory = this.builder.build(metadata);
    const player = factory.create(this.el.nativeElement);
    player.play();
  }
  destroyAnimation() {
    if (this.playAnimation) {
      this.playAnimation.destroy();
    }
  }
}


