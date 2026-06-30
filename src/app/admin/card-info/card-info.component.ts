import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService } from '../../services/games/games.service';
import { Route } from '../../services/login/login.service';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.scss']
})
export class CardInfoComponent implements OnInit {
  @Input() gameData;
  @Output() copyGames: EventEmitter<any> = new EventEmitter<any>();

  constructor(public router: Router, public storageService: StorageService, public gamesService: GamesService) { }

  ngOnInit() {
  }

  navigateToEditGamePage(game = null) {
    this.gamesService.gameBeingEdited = game;
    this.storageService.setGameObject(this.gamesService.gameBeingEdited);
    this.router.navigate([Route.MARKETPLACE_GAME]);
  }

  copyGameToMyLibrary() {
    this.gameData.is_added = true;
    this.copyGames.emit(this.gameData);
  }
}
