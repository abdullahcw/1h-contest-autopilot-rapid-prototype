import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-gameplay-by-date',
  templateUrl: './gameplay-by-date.component.html',
  styleUrls: ['./gameplay-by-date.component.scss']
})
export class GameplayByDateComponent implements OnInit {

  displayedColumns: string[] = ['level', 'game_logo', 'game', 'accuracy', 'points', 'time_played', 'start_time'];
  date;
  selectedDate;
  playerId;
  is_loading = false;
  gameplay:any = [];
  startLimit: number = 0;
  noOfItemsPerPage: number;
  notScrolly = true;
  notEmpty = true;
  isMobile = false;
  totalGames;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  constructor(
    private storageService: StorageService,
    private dashboardService: DashboardService,
    private datePipe: DatePipe,
    public translate: TranslateService,
    public globalService: GlobalService,
    private cdRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.date = moment(new Date(data.highlightedDate._d)).format('MMMM D, YYYY');
      this.selectedDate = moment(new Date(data.highlightedDate._d)).format(DATE_FORMAT);
      this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    }

  ngOnInit(): void {
    this.getGameplayByDate();
  }

  getGameplayByDate() {
    const payload = {
      "player_id": this.playerId,
      "company_id": this.storageService.getCompanyId(),
      "date": this.selectedDate,
      "offset": this.startLimit,
      "limit": this.noOfItemsPerPage
    }
    this.is_loading = true;
    this.dashboardService.getGamePlayOnDate(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      this.notScrolly = true;
      if (!response.success) {
        return;
      }
      const games = response.data.games;
      this.totalGames = response.data.total_count;
      if (!games.length || this.noOfItemsPerPage >= this.totalGames) {
        this.notEmpty = false;
      }
      this.gameplay = new MatTableDataSource(games);
    });
  }

  onScroll() {
    if (this.notScrolly && this.notEmpty) {
      this.notScrolly = false;
      this.getNextSessions();
    }
    this.cdRef.detectChanges();
  }

  getNextSessions() {
    this.noOfItemsPerPage = this.noOfItemsPerPage + Paginations.DEFAULT_ITEM_PER_PAGE;
    if (this.isMobile) {
      this.scrollTop();
    }
    this.getGameplayByDate();
  }

  scrollTop() {
    if (document.getElementById('container')) {
      document.getElementById('container').scrollTop = 0;
    }
    this.cdRef.detectChanges();
  }

  convertToHHMMSS(seconds) {
    let hours, minutes: any;
    hours = Math.floor(seconds / 3600);
    minutes = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = seconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }
    const time = hours + ':' + minutes + ':' + seconds;
    return time;
  }

  convertToHHMMAA(start_time) {
    return this.datePipe.transform(this.globalService.formatDate(start_time),'hh:mm a') 
  }

  closePopUp() {
    this.dialogRef.close();
  }
}
