import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';


export interface DialogData {
  title: string;
  message: string;
  negativeBtnText: string;
  positiveBtnText: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})



export class DialogComponent implements OnInit {

  constructor(public matDialog: MatDialog, 
    public dialogRef: MatDialogRef<DialogComponent>) { }

  showDialog(){
    /* const dialog = new MatDialogConfig();
    this.matDialog.open() */
    
  }

  close(){
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
