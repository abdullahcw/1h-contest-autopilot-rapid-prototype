import { Component, OnInit, EventEmitter } from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-tags',
  templateUrl: './add-tags.component.html',
  styleUrls: ['./add-tags.component.scss']
})
export class AddTagsComponent implements OnInit {
  onTagsUpdated = new EventEmitter();

  constructor(
    public dialogRef: MatDialogRef<any>) { }

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags;
  is_editing = false;

  ngOnInit() {
  }

  add(event: MatChipInputEvent): void {
    this.is_editing = false;
    const input = event.input;
    const value = event.value;

    // Add tag
    if ((value || '').trim() && this.tags.indexOf(value) === -1) {
      this.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }
  restrictSpace(event) {
    if (event.keyCode === 32) {
      return false;
    }
  }

  done() {
    this.onTagsUpdated.emit(this.tags);
    this.dialogRef.close();
  }

  onSearchChange(searchValue: string) {
  }
}
