import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { breadcrumbs, BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumb;
  constructor(private router: Router, public breadcrumbService: BreadcrumbsService) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.breadcrumb = breadcrumbs[this.router.url.split('?')[0]];
      }
    });
  }

  ngOnInit() {
  }

  routeToUrl(crumb, index) {
    if (index < (this.breadcrumb.length - 1)) {
      this.router.navigate([crumb.url], { queryParams: crumb.queryParams });
    }
  }
}
