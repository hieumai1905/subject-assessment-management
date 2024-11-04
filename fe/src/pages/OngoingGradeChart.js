import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Filler, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Filler, Legend);

const OngoingGradeChart = () => {
  return (
    <Bar
      className="sales-bar-chart chartjs-render-monitor"
      data={{
        labels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"],
        datasets: [
          {
            label: "Number of Students",
            data: [10, 30, 50, 40, 60, 70, 90, 110, 130],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            backgroundColor: "#eff6ff",
            titleFont: {
              size: "11px",
            },
            titleColor: "#6783b8",
            titleMarginBottom: 4,
            bodyColor: "#9eaecf",
            bodyFont: {
              size: "10px",
            },
            bodySpacing: 3,
            padding: 8,
            footerMarginTop: 0,
          },
        },
        scales: {
          y: {
            display: true,
            ticks: {
              beginAtZero: true,
              color: "#9eaecf",
              font: {
                size: "11px",
              },
              stepSize: 20,
            },
          },
          x: {
            display: true,
            ticks: {
              color: "#9eaecf",
              font: {
                size: "9px",
              },
            },
          },
        },
        maintainAspectRatio: false,
      }}
    />
  );
};

export default OngoingGradeChart;
