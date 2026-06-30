import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pathway-list-mobile',
  templateUrl: './pathway-list-mobile.component.html',
  styleUrls: ['./pathway-list-mobile.component.scss']
})
export class PathwayListMobileComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log('data',this.data)
  }
  onItemClick(itemToBeToggle) {
    itemToBeToggle.isSelected = !itemToBeToggle.isSelected;
  }

  closePopUp() {
    this.dialogRef.close();
  }

  save() {
    console.log(this.data.filter(item => item.isSelected))
    const selectedIds = this.data.filter(item => item.isSelected).map(item => item.id);
    console.log(selectedIds)
    // collect isSelected ids in new array from this.data
    if(selectedIds.length){    
      this.dialogRef.close({
        success: true,
        selectedPathways : selectedIds
      });
    }else{
      this.dialogRef.close({
        success: false,
        selectedPathways : []
      });
    }
  }

}
