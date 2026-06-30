import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from 'src/app/services/global/global.service';
import moment, { tz } from 'moment-timezone';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ReportService, GAME_MODES, PLAYER_STATUS, REPORTS, WINRATE_GAMES_TOGGEL } from 'src/app/services/reports/report.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GamesService } from 'src/app/services/games/games.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { Constants } from 'src/app/services/network/api.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { COMMA, SPACE, ENTER } from '@angular/cdk/keycodes';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';

// Required date format for payload
const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-game-accuracy-report',
  templateUrl: './game-accuracy-report.component.html',
  styleUrls: ['./game-accuracy-report.component.scss']
})
export class GameAccuracyReportComponent implements OnInit {

  selectedReportId;
  isDatePickerOpen = false;
  is_editing = false;
  emails = [];
  readonly separatorKeysCodes: number[] = [ENTER, SPACE, COMMA];
  gamesToBeDisplayed = [];
  locToBeDisplayed = [];
  deptToBeDisplayed = [];
  companiesToBeDisplayed = [];
  selectedGames = [];
  selectedWinrateGames = [];
  selectedLocations = [];
  selectedDepartments = [];
  selectedCompanies = [];
  selectedTypeOfPlayers;
  selectedTypeOfWinrateGames;
  gameModes;
  today;
  startDate;
  endDate;
  fetchingGames = false;
  fetchingLocations = false;
  fetchingCompanies = false;
  selectedGameMode;
  playerStatus;
  winrateGamesToggel;
  reports;
  company;
  isClicked = false;
  isLocationAll = false;
  isDepartmentAll = false;
  isGameAll = false;
  reportSending = false;
  @ViewChild('gameAccuracyForm', { static: true }) gameAccuracyForm: NgForm;

  constructor(private globalService: GlobalService, private reportService: ReportService,
    private storageService: StorageService, private gameService: GamesService,
    public locationService: LocationService,
    public gamesService: GamesService,
    public departmentService: DepartmentService,
    private companyService: CompanyService, private dialog: MatDialog, public translate: TranslateService) {

    this.gameModes = GAME_MODES;
    this.playerStatus = PLAYER_STATUS;
    this.winrateGamesToggel = WINRATE_GAMES_TOGGEL;
    this.reports = REPORTS;
  }

  ngOnInit() {
    this.today = this.globalService.getCurrentDate();
    this.setDefaultValues();
    this.company = this.storageService.getCompany();
    // const loginUserEmail = this.storageService.getObject('user').email;
    setTimeout(() => {
      const loginUserEmail = this.storageService.userPersonalData && this.storageService.userPersonalData.email;      
      if (loginUserEmail) {
        this.emails.push(loginUserEmail);
      }
    },1000)
  }

  setDefaultValues() {
    this.changeSelectedReport(REPORTS.GAME_ACCURACY_REPORT);
    this.selectedGameMode = this.gameModes.ALL;
    this.selectedTypeOfPlayers = this.playerStatus.ACTIVE;
    this.selectedTypeOfPlayers = this.playerStatus.ACTIVE;
    this.selectedTypeOfWinrateGames = this.winrateGamesToggel.ALLGAMES;
  }

  disableButton() {   
    let shouldDisable;
      switch (this.selectedReportId) {
        case REPORTS.GAME_ACCURACY_REPORT:
          shouldDisable = this.selectedGames.length !== 0;
          break;
        case REPORTS.WINRATE_GAME_REPORT:
            shouldDisable = (this.selectedLocations.length !== 0 && this.selectedDepartments.length !== 0 && this.selectedWinrateGames.length !== 0) ? true : false;
            break;
        case REPORTS.PLAYER_WINRATE:
            shouldDisable = (this.selectedLocations.length !== 0 && this.selectedDepartments.length !== 0 && this.selectedWinrateGames.length !== 0) ? true : false;
            break;
        case REPORTS.TOTAL_GAMES_REPORT:
            shouldDisable = (this.selectedLocations.length !== 0 && this.selectedDepartments.length !== 0) ? true : false;               
            break;

        case REPORTS.MASTER_REPORT_ACROSS_COMPANIES:
          case REPORTS.COMPANY_GAME_REPORT:
          shouldDisable = this.selectedCompanies.length !== 0;
          break;
      }
    return !this.gameAccuracyForm.valid || this.emails.length === 0 || !shouldDisable;
  }

  getPinGames() {
    const pingamePayload = {
      'company_id': this.storageService.getCompanyId(),
      'manager_id': this.storageService.getLoginUserID(),
    };
    this.fetchingGames = true;
    this.gamesService.getPinnedGamesListForMoreReport(pingamePayload).subscribe((res) => {      
      const response: any = res;
      if (!response.success) {
        this.fetchingGames = false;
        return;
      }
      if (response.data) {
        this.prepareGames(response.data.pinned_games);
      }

    });
  }

  getGames() {
    const companyId = this.storageService.getCompanyId();
    this.fetchingGames = true;
    this.selectedGameMode = this.selectedGameMode ? this.selectedGameMode : this.gameModes.ALL;

    const filters = 'game_type=' + 1; // 1 = for SP games
    this.gameService.getGames(companyId, 'game_name', 'asc', 0, 5000, filters, true, true).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.fetchingGames = false;
        return;
      }
      if (response.data) {
        this.prepareGames(response.data.game_list);
      }
    });
  }

  getDepartments() {    
    this.fetchingLocations = true;
    this.departmentService.getDepartments(this.storageService.getCompanyId(), 'department_name', 'asc', 0, 0, null, false).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.fetchingLocations = false;
        return;
      }
      if (response.data) {
        this.prepareDepartments(response.data.department_list);
      }
           
    });
  }

  getLocations() {    
    this.fetchingLocations = true;
    this.locationService.getLocations(this.storageService.getCompanyId(),
    Constants.LOCATION_NAME, 'asc', 0, 0, null, false).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.fetchingLocations = false;
        return;
      }
      if (response.data) {
        this.prepareLocations(response.data.location_list);
      }
    });
  }


  showActiveOption() {
    if(this.selectedReportId == this.reports.WINRATE_GAME_REPORT ){
      return false; 
    }else if(this.selectedReportId == this.reports.PLAYER_WINRATE){
      return false; 
    }
    else if(this.selectedReportId == this.reports.TOTAL_GAMES_REPORT){
      return false;
    }else{
      return true;
    }
  }
  changeSelectedReport(selectedReportId, fromHeader = false) {    
    this.selectedReportId = selectedReportId;
    this.resetLastSelections();
    this.resetDates();
    switch (this.selectedReportId) {
      case REPORTS.GAME_ACCURACY_REPORT:
        this.globalService.addAdminGoogleEvent('Individual_Games_Report_Selected');
        this.getGames();
        break;
      case REPORTS.WINRATE_GAME_REPORT:
        this.getLocations();
        this.getDepartments();
        this.getGames();      
        this.selectedTypeOfWinrateGames = this.winrateGamesToggel.ALLGAMES;
        this.globalService.addAdminGoogleEvent('Winrate_Report_Selected');  
        break;
      case REPORTS.PLAYER_WINRATE:
        this.getLocations();
        this.getDepartments();
        this.getGames();      
        this.selectedTypeOfWinrateGames = this.winrateGamesToggel.ALLGAMES; 
        this.globalService.addAdminGoogleEvent('Player_Winrate_Report_Selected');  
        break;
      case REPORTS.TOTAL_GAMES_REPORT:
        this.getLocations();
        this.getDepartments();
        this.globalService.addAdminGoogleEvent('Total_Game_Report_Selected');
        break;
      case REPORTS.MASTER_REPORT_ACROSS_COMPANIES:
      case REPORTS.COMPANY_GAME_REPORT:
        if (!fromHeader) {
          this.getCompanies();
        }
        break;

    }
  }

  resetLastSelections() {
    this.selectedCompanies = [];
    this.selectedGames = [];
    this.selectedDepartments = [];
    this.selectedLocations = [];
    this.selectedWinrateGames = [];
  }

  getCompanies() {
    this.fetchingCompanies = true;
    this.companyService.getCompanies(Constants.COMPANY_NAME, 'asc', 0, 2000, null).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.fetchingCompanies = false;
        return;
      }
      if (response.data) {
        this.prepareCompanies(res.data.company_list);
      }
    });
  }

  prepareGames(gamesToBePrepare, forceSelected = false) {
    this.gamesToBeDisplayed = [];
    gamesToBePrepare.forEach(game => {
      this.gamesToBeDisplayed.push({ id: game.game_id, title: game.game_name,
        isSelected: forceSelected, isDeleted: game.is_deleted });
    });
    this.fetchingGames = false;
  }

  prepareLocations(locToBePrepare, forceSelected = false) {
    this.locToBeDisplayed = [];
    locToBePrepare.forEach(loc => {
      this.locToBeDisplayed.push({ id: loc.location_id, title: loc.location_name,
        isSelected: forceSelected, isDeleted: false });
    });
    this.fetchingLocations = false;
  }

  prepareDepartments(locToBePrepare, forceSelected = false) {
    this.deptToBeDisplayed = [];
    locToBePrepare.forEach(dept => {
      this.deptToBeDisplayed.push({ id: dept.department_id, title: dept.department_name,
        isSelected: forceSelected, isDeleted: false });
    });
    this.fetchingLocations = false;
  }


  prepareCompanies(companies, forceSelected = false) {
    this.companiesToBeDisplayed = [];
    companies.forEach(company => {
      this.companiesToBeDisplayed.push({ id: company.company_id, title: company.company_name, isSelected: forceSelected });
    });
    this.fetchingCompanies = false;
  }

  setStartDate(startDate) {
    this.startDate = startDate;
  }

  setEndDate(endDate) {
    this.endDate = endDate;
  }

  validateEmail(emailInput) {
    const re = new RegExp('\\S+@\\S+\\.\\S+');
    const emailNotValid = re.test(emailInput);
    return emailNotValid;
  }

  onGameSelectionUpdated(updatedGameSelection) {
    this.selectedGames = updatedGameSelection;
    if (this.selectedGames.length > 1) {
      this.globalService.addAdminGoogleEvent('More_Reports_By_Game_Selected_Multiple');
    } else {
      this.globalService.addAdminGoogleEvent('More_Reports_By_Game_Selected_single');
    }
  }

  onLocationSelectionUpdated(updatedLocSelection) {

    // to set isLocationAll to true if all locations are selected
    if(this.locToBeDisplayed.length == updatedLocSelection.length){
      this.isLocationAll = true;
    }else{
      this.isLocationAll = false;
    }
    this.selectedLocations = updatedLocSelection;    
    if (this.selectedReportId == REPORTS.WINRATE_GAME_REPORT) {
      this.globalService.addAdminGoogleEvent('Winrate_Location_Selected');
    } else  if (this.selectedReportId == REPORTS.TOTAL_GAMES_REPORT) {
      this.globalService.addAdminGoogleEvent('Total_Games_Location_Selected');
    } else if (this.selectedReportId == REPORTS.PLAYER_WINRATE) {
      this.globalService.addAdminGoogleEvent('Player_Winrate_Location_Selected');
    }
  }

  onDepartmentSelectionUpdated(updateddeptSelection) {

    if(this.deptToBeDisplayed.length == updateddeptSelection.length){
      this.isDepartmentAll = true;
    }else{
      this.isDepartmentAll = false;
    }

    this.selectedDepartments = updateddeptSelection;    
    if (this.selectedReportId == REPORTS.WINRATE_GAME_REPORT) {
      this.globalService.addAdminGoogleEvent('Winrate_Department_Selected');
    } else  if (this.selectedReportId == REPORTS.TOTAL_GAMES_REPORT) {
      this.globalService.addAdminGoogleEvent('Total_Games_Department_Selected');
    } else if (this.selectedReportId == REPORTS.PLAYER_WINRATE) {
      this.globalService.addAdminGoogleEvent('Player_Winrate_Department_Selected');
    }
  }

  onWinRateGameSelectionUpdated(updatedGameSelection) {
    this.selectedWinrateGames = updatedGameSelection;

    if(this.gamesToBeDisplayed.length == updatedGameSelection.length){
      this.isGameAll = true;
    }else{
      this.isGameAll = false;
    }

    if(this.selectedTypeOfWinrateGames == this.winrateGamesToggel.ALLPINNED){
      if(this.selectedReportId == REPORTS.WINRATE_GAME_REPORT){
        this.globalService.addAdminGoogleEvent('Winrate_Pinned_Games_Selected'); 
      }else if(this.selectedReportId == REPORTS.PLAYER_WINRATE){
        this.globalService.addAdminGoogleEvent('Player_Winrate_Pinned_Games_Selected'); 
      }
    } else {
      if(this.selectedReportId == REPORTS.WINRATE_GAME_REPORT){
        this.globalService.addAdminGoogleEvent('Winrate_Games_Selected');
      }else if(this.selectedReportId == REPORTS.PLAYER_WINRATE){
        this.globalService.addAdminGoogleEvent('Player_Winrate_Games_Selected');
      }
    }
  }

  onCompanySelectionUpdated(selectedCompanies) {
    this.selectedCompanies = selectedCompanies;
  }

  addEmailChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    const values = value.split(/[ ,]+/);
    if (values && values.length !== 0) {
      const totalEmails = values.length;
      for (let i = 0; i < totalEmails; i++) {
        if (!this.validateEmail(values[i])) { continue; }
        // Add email
        if ((values[i] || '').trim()) {
          this.emails.push(values[i].trim());
        }
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeFilter(email) {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  sendEmail() {
    switch (this.selectedReportId) {
      case REPORTS.GAME_ACCURACY_REPORT:
        this.emailGameAccuracyReport();
        break;
      case REPORTS.MASTER_REPORT_ACROSS_COMPANIES:
        this.emailMasterReport();
        break;
        case REPORTS.WINRATE_GAME_REPORT:          
        this.winRateReport();
          break;
        case REPORTS.PLAYER_WINRATE:
          this.playerWinRateReport();
          break;
        case REPORTS.TOTAL_GAMES_REPORT:
          this.totalGamesReport();
  
          break;

      case REPORTS.COMPANY_GAME_REPORT:
        this.emailCompanyGameReport();
        break;
    }
  }

  logEvent(payload) {
    switch (payload.player_status) {
      case 'ACTIVE':
        this.globalService.addAdminGoogleEvent('More_Reports_By_Players_Type_Selected_Active');
        break;
      default:
        this.globalService.addAdminGoogleEvent('More_Reports_By_Players_Type_Selected_All');
    }
    switch (payload.game_mode) {
      case 'PRACTICE':
        this.globalService.addAdminGoogleEvent('More_Reports_By_Game_Mode_Selected_Practice');
        break;
      case 'CONTEST':
        this.globalService.addAdminGoogleEvent('More_Reports_By_Game_Mode_Selected_Live');
        break;
      default:
        this.globalService.addAdminGoogleEvent('More_Reports_By_Game_Mode_Selected_All');
    }
    if (payload.start_date) {
      this.globalService.addAdminGoogleEvent('More_Reports_By_Report_Duration_Selected_Start_Date');

    }
    if (payload.end_date) {
      this.globalService.addAdminGoogleEvent('More_Reports_By_Report_Duration_Selected_End_Date');
    }
  }

  emailCompanyGameReport() {
    const payload = this.prepareCompanyGamePayload();
    this.logEvent(payload);
    this.reportSending = true;
    this.reportService.emailCompanyGameReport(payload).subscribe(res => {
      const response: any = res;
      this.reportSending = false;
      if (!response.success) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
        return;
      }
      this.resetDates();
      this.showAlert(this.translate.instant('success'), this.translate.instant('report_sent_via_email'));
    });
  }

  emailGameAccuracyReport() {
    const payload = this.prepareGameAccuracyPayload();
    this.logEvent(payload);
    this.reportSending = true;
    this.reportService.emailGameAccuracyReport(payload).subscribe(res => {
      const response: any = res;
      this.reportSending = false;
      if (!response.success) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
        return;
      }
      this.resetDates();
      this.globalService.addAdminGoogleEvent('Individual_Games_Email_Send');
      this.showAlert(this.translate.instant('success'), this.translate.instant('report_sent_via_email'));
    });
  }

  emailMasterReport() {
    const payload = this.prepareCompaniesMasterReportPayload();
    this.logEvent(payload);
    this.reportSending = true;
    this.reportService.emailMasterReportAcrossCompany(payload).subscribe(res => {
      const response: any = res;
      this.reportSending = false;
      if (!response.success) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
        return;
      }
      this.resetDates();
      this.showAlert(this.translate.instant('success'), this.translate.instant('report_sent_via_email'));
    });
  }
  
  winRateReport() {
    const payload = this.prepareCompaniesWinrateReportPayload();
    console.log(payload)
    this.reportSending = true;
    this.reportService.emailwinrateReport(payload).subscribe(res => {
      const response: any = res;
      this.reportSending = false;
      if (!response.success) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
        return;
      }
      this.globalService.addAdminGoogleEvent('Winrate_Email_Send');
      this.showAlert(this.translate.instant('success'), this.translate.instant('report_sent_via_email'));
    });
  }

  playerWinRateReport() {
    const payload = this.prepareCompaniesPlayerWinrateReportPayload();
    console.log(payload)
    this.reportSending = true;

     if (payload.start_date) {
      this.globalService.addAdminGoogleEvent('More_Reports_By_Report_Duration_Selected_Start_Date');

    }
    if (payload.end_date) {
      this.globalService.addAdminGoogleEvent('More_Reports_By_Report_Duration_Selected_End_Date');
    }
    this.reportService.emailhistoricalwinrateReport(payload).subscribe(res => {
      const response: any = res;
      this.reportSending = false;
      if (!response.success) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
        return;
      }
      this.globalService.addAdminGoogleEvent('Player_Winrate_Email_Send');
      this.showAlert(this.translate.instant('success'), this.translate.instant('report_sent_via_email'));
    });
  }

  totalGamesReport(){
    const payload = this.prepareCompaniesTotalPlayedReportPayload();
    this.reportSending = true;
    this.reportService.emailtotalGameplayReport(payload).subscribe(res => {
      const response: any = res;
      this.reportSending = false;
      if (!response.success) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
        return;
      }
      this.globalService.addAdminGoogleEvent('Total_Games_Email_Send');
      this.showAlert(this.translate.instant('success'), this.translate.instant('report_sent_via_email'));
    });
  }

  resetDates() {
    this.startDate = '';
    this.endDate = '';
    this.isClicked = false;
  }
  prepareCompanyGamePayload() {
    this.company = this.storageService.getCompany();
    if (!this.company) {
      this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
      return null;
    }
    const payload = {
      'company_ids': this.prepareSelectedCompanyIds(),
      'start_date': this.getPayloadSupportedDateFormat(this.startDate),
      'end_date': this.getPayloadSupportedDateFormat(this.endDate),
      'timezone': this.company['location_details'] && this.company['location_details']['tz_name'],
      'email_ids': this.emails
    };
    this.ignoreAllFilter(payload, 'game_mode', this.selectedGameMode);
    return payload;
  }
  prepareGameAccuracyPayload() {
    this.company = this.storageService.getCompany();
    if (!this.company) {
      this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
      return null;
    }
    const payload = {
      'company_id': this.company['company_id'],
      'start_date': this.getPayloadSupportedDateFormat(this.startDate),
      'end_date': this.getPayloadSupportedDateFormat(this.endDate),
      'sort_by': 'first_name',
      'order': 'asc',
      'game_ids': this.prepareSelectedGameIds(),
      'timezone': this.company['location_details'] && this.company['location_details']['tz_name'],
      'email_ids': this.emails
    };
    this.ignoreAllFilter(payload, 'game_mode', this.selectedGameMode);
    this.ignoreAllFilter(payload, 'player_status', this.selectedTypeOfPlayers);
    return payload;
  }

  prepareCompaniesMasterReportPayload() {
    this.company = this.storageService.getCompany();
    if (!this.company) {
      this.showAlert(this.translate.instant('error'), this.translate.instant('report_error'));
      return null;
    }
    const payload = {
      'company_ids': this.prepareSelectedCompanyIds(),
      'start_date': this.getPayloadSupportedDateFormat(this.startDate),
      'end_date': this.getPayloadSupportedDateFormat(this.endDate),
      'sort_by': 'company_name',
      'order': 'asc',
      'timezone': this.company['location_details'] && this.company['location_details']['tz_name'],
      'email_ids': this.emails
    };
    this.ignoreAllFilter(payload, 'game_mode', this.selectedGameMode);
    this.ignoreAllFilter(payload, 'player_status', this.selectedTypeOfPlayers);
    return payload;
  }

  prepareCompaniesWinrateReportPayload() {   
    let gameIDsList = [];   
    if(this.selectedTypeOfWinrateGames == this.winrateGamesToggel.ALLPINNED){
      gameIDsList = this.prepareWinrateSelectedGameIds();
    }else{
      gameIDsList = this.isGameAll ? [] : this.prepareWinrateSelectedGameIds()
    }
    const payload = {   
      company_id: this.storageService.getCompanyId(),   
      location_ids: this.isLocationAll ? [] :  this.prepareSelectedLocIds(),
      game_ids: gameIDsList,
      department_ids: this.isDepartmentAll ? [] : this.prepareSelectedDeptIds(),
      is_location_all: this.isLocationAll,
      is_department_all: this.isDepartmentAll,
      is_game_all: this.isGameAll,
      email_ids: this.emails,
      is_pinned_game: this.selectedTypeOfWinrateGames == this.winrateGamesToggel.ALLPINNED ? true : false,
    };    
    return payload;
  }

  prepareCompaniesPlayerWinrateReportPayload() {   
    let gameIDsList = [];   
    if(this.selectedTypeOfWinrateGames == this.winrateGamesToggel.ALLPINNED){ 
      gameIDsList = this.prepareWinrateSelectedGameIds();
    }else{
      gameIDsList = this.isGameAll ? [] : this.prepareWinrateSelectedGameIds()
    }
    const payload = {   
      company_id: this.storageService.getCompanyId(),   
      location_ids: this.isLocationAll ? [] :  this.prepareSelectedLocIds(),
      department_ids: this.isDepartmentAll ? [] : this.prepareSelectedDeptIds(),
      is_department_all: this.isDepartmentAll,
      is_location_all: this.isLocationAll,
      is_pinned_game: this.selectedTypeOfWinrateGames == this.winrateGamesToggel.ALLPINNED ? true : false,
      game_ids: gameIDsList,
      is_game_all: this.isGameAll,
      email_ids: this.emails,
      start_date: this.getPayloadSupportedDateFormat(this.startDate),
      end_date: this.getPayloadSupportedDateFormat(this.endDate),      
    };    
    return payload;
  }

  prepareCompaniesTotalPlayedReportPayload() {      
    const payload = {  
      company_id: this.storageService.getCompanyId(),             
      location_ids: this.isLocationAll ? [] :  this.prepareSelectedLocIds(),
      department_ids: this.isDepartmentAll ? [] : this.prepareSelectedDeptIds(),
      is_location_all: this.isLocationAll,
      is_department_all: this.isDepartmentAll,
      start_date: this.getPayloadSupportedDateFormat(this.startDate),
      end_date: this.getPayloadSupportedDateFormat(this.endDate),      
      email_ids: this.emails,      
    };    
    return payload;
  }

  ignoreAllFilter(payload, keyToAdd, value) {
    // tslint:disable-next-line:triple-equals
    if (value != 'ALL') {
      payload[keyToAdd] = value;
    }
    return payload;
  }

  getPayloadSupportedDateFormat(dateToBeFormatted) {
    return moment(dateToBeFormatted).format(DATE_FORMAT);
  }

  prepareSelectedGameIds() {
    const gameIds = [];
    this.selectedGames.forEach(game => {
      gameIds.push(game.id);
    });
    return gameIds;
  }

  prepareWinrateSelectedGameIds() {
    const gameIds = [];
    this.selectedWinrateGames.forEach(game => {
      gameIds.push(game.id);
    });
    return gameIds;
  }

  prepareSelectedLocIds() {
    const locIDS = [];    
    this.selectedLocations.forEach(loc => {
      locIDS.push(loc.id);
    });
    return locIDS;
  }

  prepareSelectedDeptIds() {
    const deptIDS = [];
    this.selectedDepartments.forEach(loc => {
      deptIDS.push(loc.id);
    });
    return deptIDS;
  }

  prepareSelectedCompanyIds() {
    const companyIds = [];
    this.selectedCompanies.forEach(company => {
      companyIds.push(company.id);
    });
    return companyIds;
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  isAllOptionSelected(value,key){
  }

  playersRadioButtonCliked() {      
    if(this.selectedTypeOfPlayers ==   this.playerStatus.ACTIVE){
     this.globalService.addAdminGoogleEvent('Individual_Games_Active_Players_Selected');     
    }else{     
     this.globalService.addAdminGoogleEvent('Individual_Games_All_Players_Selected');
    }
   }
  radioButtonCliked() {      
   if(this.selectedTypeOfWinrateGames ==   this.winrateGamesToggel.ALLPINNED){
    if(this.selectedReportId == REPORTS.WINRATE_GAME_REPORT){
    this.globalService.addAdminGoogleEvent('Winrate_All_Pinned_Games_Selected');
    }else if(this.selectedReportId == REPORTS.PLAYER_WINRATE){
      this.globalService.addAdminGoogleEvent('Player_Winrate_All_Pinned_Games_Selected');
    }
    this.selectedWinrateGames = [];
    this.getPinGames();
   }else{
    this.selectedWinrateGames = [];
    this.getGames();
    if(this.selectedReportId == REPORTS.WINRATE_GAME_REPORT){
    this.globalService.addAdminGoogleEvent('Winrate_All_Games_Selected');
    }else if(this.selectedReportId == REPORTS.PLAYER_WINRATE){
      this.globalService.addAdminGoogleEvent('Player_Winrate_All_Games_Selected');
    }
  }  
  }
} 
