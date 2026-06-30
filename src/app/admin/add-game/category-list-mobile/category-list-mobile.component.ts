import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-category-list-mobile',
  templateUrl: './category-list-mobile.component.html',
  styleUrls: ['./category-list-mobile.component.scss']
})
export class CategoryListMobileComponent implements OnInit {
  game_category_id;
  categgoryRequired = false;
  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }
  onItemClick(itemToBeToggle) {
    itemToBeToggle.isSelected = !itemToBeToggle.isSelected;
  }

  closePopUp() {
    this.dialogRef.close();
  }

  save(item) {
 // collect isSelected ids in new array from this.data
    if(item.id){    
      this.dialogRef.close({
        success: true,
        selectedId : item.id
      });
    }else{
      this.dialogRef.close({
        success: false,
        selectedId : null
      });
    }
  }

}
