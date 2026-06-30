import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GamesService } from '../../services/games/games.service';
import { GlobalService, MediaBreakpoint } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-game-icon-picker',
  templateUrl: './game-icon-picker.component.html',
  styleUrls: ['./game-icon-picker.component.scss']
})
export class GameIconPickerComponent implements OnInit {
  defaultBreakpoint = 4;
  breakpoint = this.defaultBreakpoint;
  selectedImage: any;
  imageSelected = new EventEmitter();
  attachImageClicked = new EventEmitter();
  staticImages: any[];

  constructor(public dialogRef: MatDialogRef<any>, private globalService: GlobalService,
    public gameService: GamesService) { }

  ngOnInit() {
    this.calculateBreakpoint();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateBreakpoint();
  }

  calculateBreakpoint() {
    this.breakpoint = window.innerWidth / 200;
    if (this.breakpoint > this.defaultBreakpoint) {
      this.breakpoint = 4;
    }
    if (window.innerWidth <= MediaBreakpoint.XS) { // code review
      this.breakpoint = 3;
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    this.imageSelected.emit(this.selectedImage);
    this.dialogRef.close();
  }

  attachImage() {
    this.attachImageClicked.emit();
    this.dialogRef.close();
  }
}
