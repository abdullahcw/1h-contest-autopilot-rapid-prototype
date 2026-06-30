import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js';
@Component({
  selector: 'app-mlg-circle-chart',
  templateUrl: './mlg-circle-chart.component.html',
  styleUrls: ['./mlg-circle-chart.component.scss']
})
export class MlgCircleChartComponent implements OnInit {
  @ViewChild('circleChart') circleChart: ElementRef;
  @Input() circleChartData: any;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() { // wait for the view to init before using the element
    console.log(this.circleChartData)
    if (this.circleChart) {
      let context: CanvasRenderingContext2D =
        this.circleChart.nativeElement.getContext("2d");
      var myDoughnutChart = new Chart(context, {
        type: "doughnut",
        data: {
          labels: ["Won", "In-Progress"],
          datasets: [
            {
              data: this.circleChartData,
              backgroundColor: ["#3F55CA", "#9C9C9C"],
              borderWidth: 3,
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },
          tooltips: {
            callbacks: {
              label: (ctx, data) =>
                `${ctx.index == 0 ? " Won:" : " In Progress:"} ${
                  data.datasets[ctx.datasetIndex].data[ctx.index]
                }%`,
            },
          },
          cutoutPercentage: 55,
          responsive: true,
          maintainAspectRatio: true,
          rotation: -1 * Math.PI,
        },
      });
    }
  }

  showChart() {
    if (this.circleChartData) {
      if (this.circleChartData.some(val => val > 0)) {
        return true;
      }
      if (this.circleChartData.every(val => val == 0)) {
        return false;
      }
    }
  }
}
