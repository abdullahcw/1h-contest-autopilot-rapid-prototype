import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { LocationService } from 'src/app/services/location/location.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnChanges {
    // private readonly _myService: PlayerService;
    @ViewChild('menuTrigger', { static: true }) triggerMenu: ElementRef;
    @ViewChild('menuTrigger', { read: MatMenuTrigger, static: true }) menuTrigger: MatMenuTrigger;
      listOfObject: any[];
    constructor(public playerService: PlayerService,
      public locationService:LocationService,
      public storageService:StorageService,
      ) {}
  
  @Input() openCustomMenu;
  @Input() fieldType;
  @Input() selectedId;
  @Input() ref: MatMenu;
  @Input() searchKeyValue;

  ngOnInit(): void {
    console.log('fieldType',this.fieldType);
   
  }
  
  ngOnChanges(changes: SimpleChanges) {
    console.log('changes',changes);
  if (changes.openCustomMenu && !changes.openCustomMenu.firstChange) {
    this.onContextMenu(this.openCustomMenu);
    if(this.fieldType === 'location_id'){
      this.fetchLocation();
    }else if (this.fieldType === 'department_id') {
      this.fetchDepartment();
    }
  }
  }
  fetchLocation(){
    this.listOfObject = [];
    this.locationService.getPlayerAllLocations(this.storageService.getCompanyId(),this.selectedId).subscribe((res) => {
        const response: any = res;
        if (!response.success) { return; }
        if (response.data) {
          this.listOfObject = response.data.location;
        }
      });
  }
 fetchDepartment(){ 
   this.listOfObject = [];
      this.locationService.getPlayerAllDepartments(this.storageService.getCompanyId(),this.selectedId).subscribe((res) => {
        const response: any = res;
        if (!response.success) { return; }
        if (response.data) {
          this.listOfObject = response.data.department;
        }
      });
 }


  onContextMenu(e: any, question = null): void {
    e.preventDefault();
    this.menuTrigger.closeMenu();
    const menu = this.triggerMenu.nativeElement;
    if (menu) {
      menu.style.left = e.pageX - 20  + 'px';
      menu.style.top = e.pageY  - 20 + 'px';
    }
    this.menuTrigger.openMenu();
    return;
  }

  
}

