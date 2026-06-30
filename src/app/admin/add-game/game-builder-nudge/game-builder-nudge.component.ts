import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-builder-nudge',
  templateUrl: './game-builder-nudge.component.html',
  styleUrls: ['./game-builder-nudge.component.scss']
})
export class GameBuilderNudgeComponent implements OnInit {
index = 0;
  constructor(public dialogRef: MatDialogRef<any>,
    private cdf: ChangeDetectorRef) {
  
  }
data = [
  {
  'title':'Create in Different Languages',
 'text':'Now you can add questions in multiple languages so players can play the same game in their preferred language. '

},
  {
  'title':'Change Question View',
  'text':'Now you can view your questions in different languages. '

},
]
  ngOnInit(): void {
  }
  cancel(){
    this.dialogRef.close(true);
  }
  next(){
    this.index++;
  }
  previous(){
    this.index--;
  }
}
