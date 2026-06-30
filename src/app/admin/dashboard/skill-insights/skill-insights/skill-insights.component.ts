import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { emit } from 'process';
import { DashboardService, DashboardTabType } from 'src/app/services/dashboard/dashboard.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Route } from 'src/app/services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';


@Component({
  selector: 'app-skill-insights',
  templateUrl: './skill-insights.component.html',
  styleUrls: ['./skill-insights.component.scss']
})
export class SkillInsightsComponent implements OnInit {
@Input() selectedDashboardTabType = DashboardTabType.SKILL_INSIGHTS;
@Input() selectedDashboardTabTypeChanges = false;
dashboardTypeChanged: any;
dashboardTabType = DashboardTabType ;
companyDeatils;
  companyChangeSubscription: any;
  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private globalService: GlobalService,
    private delegateService: DelegateService,
    private storageService: StorageService,
    public translate: TranslateService,
  ) {
    this.companyChangeSubscription = this.delegateService.companyDetailsUpdated.subscribe((company) => {
     if(company){
       this.companyDeatils = company;
     }
    });

   }

  ngOnInit(): void {
    this.companyDeatils = this.storageService.getCompany();
  }
  
  checkDashboardType(type: DashboardTabType) {
    console.log(this.selectedDashboardTabType);
    return this.selectedDashboardTabType === type;
  }
  onValChange(event)  {  
    console.log(event)  
    this.selectedDashboardTabType = event;
    switch (event) {
      case DashboardTabType.ENGAGEMENT_INSIGHTS:
        this.globalService.addAdminGoogleEvent('Dashboard_Reports_Engagement_Insights')
        this.router.navigate([Route.ENGAGEMENT_INSIGHTS]);
        break;
        case DashboardTabType.PATHWAY_INSIGHTS:
        this.globalService.addAdminGoogleEvent('Dashboard_Reports_Pathway_Insights')
        this.router.navigate([Route.PATHWAY_INSIGHT]);
        break;
        
        default:
        this.globalService.addAdminGoogleEvent('Dashboard_Reports_Skill_Insights')
        this.router.navigate([Route.DASHBOARD]);
        break;
    }

  }
  addEvent(){

    this.globalService.addAdminGoogleEvent
    
  }
  
}
