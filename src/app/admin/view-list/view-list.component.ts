import { Component, OnInit, Input, ViewChild, OnChanges, Output, EventEmitter } from '@angular/core';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss']
})
export class ViewListComponent implements OnInit, OnChanges {

  // selectSearchFilterKey = 'department_name';
  selectedSearchKey;
  manager;
  @Input() selectSearchFilterKey: any;
  @Input() dataSource: any;
  @Input() viewListTrigger: any;
  @ViewChild('rightClickMenu', { read: MatMenuTrigger, static: true }) menuTrigger: MatMenuTrigger;
  @ViewChild('customMenu', { read: MatMenuTrigger, static: true }) customMenu: MatMenu;
  @Output() CustomMenuEmitter: EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit() {
    console.log('viewListTrigger', this.viewListTrigger);
    console.log('this.menuTrigger', this.menuTrigger);
    // if (this.menuTrigger) {
    //   this.menuTrigger.openMenu();
    // }
    this.CustomMenuEmitter.emit(this.customMenu);
  }

  ngOnChanges(changes) {
    console.log('changes.viewListTrigger', changes.viewListTrigger);
    console.log('this.menuTrigger', this.menuTrigger);
    if (changes.viewListTrigger && !changes.viewListTrigger.firstChange) {
      console.log('This is a menu trigger');
      changes.viewListTrigger.openMenu();
    }
  }

}
