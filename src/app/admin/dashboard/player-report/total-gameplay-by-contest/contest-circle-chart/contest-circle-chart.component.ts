import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js';
@Component({
  selector: 'app-contest-circle-chart',
  templateUrl: './contest-circle-chart.component.html',
  styleUrls: ['./contest-circle-chart.component.scss']
})
export class ContestCircleChartComponent implements OnInit {
  @Input() completion;
  @ViewChild('circleChart') circleChart: ElementRef;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() { // wait for the view to init before using the element
    this.generateChart();
  }

  generateChart() {
    if (this.circleChart && this.completion) {
      let context: CanvasRenderingContext2D =
        this.circleChart.nativeElement.getContext("2d");

      var myDoughnutChart = new Chart(context, {
        type: "doughnut",
        data: {
          labels: [],
          datasets: [
            {
              data: this.completion.completion_values,
              backgroundColor: ["#3F55CA", "#9C9C9C"],
              borderWidth: 3,
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },
          cutoutPercentage: 45,
          tooltips: { enabled: false },
          hover: { mode: null },
          responsive: true,
          maintainAspectRatio: true,
          rotation: -1 * Math.PI,
        },
      });
    }
  }

}
