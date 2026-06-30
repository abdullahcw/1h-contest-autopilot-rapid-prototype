import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-numbers',
  templateUrl: './numbers.component.html',
  styleUrls: ['./numbers.component.scss']
})
export class NumbersComponent implements OnInit {

  @Input() value: any;

  constructor() { }

  ngOnInit(): void {
    this.formatNumber()
  }

  formatNumber() {
    if (this.value) {
      this.value = this.value.toLocaleString('en-US');
    }
  }

}
