import { Component, HostListener, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-gameplay-card',
  templateUrl: './gameplay-card.component.html',
  styleUrls: ['./gameplay-card.component.scss']
})
export class GameplayCardComponent implements OnInit {
  @Input() resetView = false;
  @Input() matTiles = [];
  @Input() fetchingAllLocations = false;
  @Input() selectedDashboardType;
  @Input() dashboard;
  gameplayData: any;
  breakpoint = 2;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth <= 1024) {
      this.calculateBreakpoint();
    } else {
      this.breakpoint = 2;
    }
  }

  constructor() {
  }

  calculateBreakpoint() {
    this.breakpoint = window.innerWidth / 600;
    if (this.breakpoint <= 1.8 && this.breakpoint > 1.2) {
      this.breakpoint = 1.4;
    }
  }

  ngOnInit() {  }


}
