import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage/storage.service';


@Component({
  selector: 'app-multilevel-games-list',
  templateUrl: './multilevel-games-list.component.html',
  styleUrls: ['./multilevel-games-list.component.scss']
})
export class MultilevelGamesListComponent implements OnInit {

  constructor(public router: Router, public storage: StorageService) { }

  ngOnInit() {
    this.storage.setTeb('mlg');
    this.router.navigate(['/admin/games']);

  }


}
