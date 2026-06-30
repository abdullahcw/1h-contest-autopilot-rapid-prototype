import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Role } from 'src/app/services/permissions/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';

@Component({
  selector: 'app-card-entity',
  templateUrl: './card-entity.component.html',
  styleUrls: ['./card-entity.component.scss']
})
export class CardEntityComponent implements OnInit {

  @Input() cardData;
  @Input() totalGames;
  @Output() addItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() editItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() positionChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() cardClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input() updatedData;
  role = Role;
  constructor(public storageService: StorageService,
    public dialog: MatDialog,
    public marketplaceService: MarketplaceService,
    public router: Router,
    public translate: TranslateService) {
  }

  ngOnInit() {
  }

  add(item) {
    this.addItem.emit(item);
  }

  edit(item) {
    this.editItem.emit(item);
    
  }

  remove(item) {
    this.removeItem.emit(item);
  }

  changePosition(item) {    
    const positionObj = {
      cardData : item,
      total_count : this.totalGames,
    }
    this.positionChange.emit(positionObj);    
  }

  cardClick(item) {
    this.cardClicked.emit(item);
  }
}
