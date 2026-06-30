import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-add-edit-question',
  templateUrl: './add-edit-question.component.html',
  styleUrls: ['./add-edit-question.component.scss']
})
export class AddEditQuestionComponent implements OnInit {
  question;
  timer_options;
points_options;
  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public message: any) { }

  ngOnInit() {
    this.question = this.message.question;
    this.timer_options = this.message.timer_options;
    this.points_options = this.message.points_options;
  }

  closeModal(reason = null) {
    this.dialogRef.close(reason);
  }

}
