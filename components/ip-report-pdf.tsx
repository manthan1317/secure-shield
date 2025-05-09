import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ChartData,
  ChartOptions,
  PieController,
  BarController,
  LineController,
  RadarController,
} from "chart.js";
import { Pie, Bar, Line, Radar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { IpData, SecurityAssessment } from "./ip-analysis";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  PieController,
  BarController,
  LineController,
  RadarController
);

interface IpReportPDFProps {
  ipData: IpData;
  securityData: SecurityAssessment;
}

const createChartImage = async (
  chartData: ChartData,
  type: string,
  width: number,
  height: number
): Promise<string> => {
  const container = document.createElement("div");
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    const chart = new ChartJS(ctx, {
      type: type as any,
      data: chartData,
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
          },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const image = await html2canvas(canvas, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    chart.destroy();
    document.body.removeChild(container);

    return image.toDataURL("image/png", 1.0);
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
};

const getRiskColor = (score: number): string => {
  if (score < 20) return "#22c55e"; // green
  if (score < 40) return "#10b981"; // emerald
  if (score < 60) return "#eab308"; // yellow
  if (score < 80) return "#f97316"; // orange
  return "#ef4444"; // red
};

export const generateIpReportPDF = async (
  ipData: IpData,
  securityData: SecurityAssessment
) => {
  const doc = new jsPDF();

  // Add title and header
  doc.setFontSize(22);
  doc.text("IP Security Analysis Report", 105, 20, { align: "center" });

  // Add IP details
  doc.setFontSize(12);
  doc.text(`IP Address: ${ipData.ip}`, 20, 35);
  doc.text(`Analysis Date: ${new Date().toLocaleDateString()}`, 20, 42);

  try {
    // Security Assessment Section
    doc.setFontSize(16);
    doc.text("Security Assessment", 20, 55);

    // Create risk score pie chart
    const riskPieData = {
      labels: ["Risk Score", "Safety Score"],
      datasets: [
        {
          data: [securityData.risk_score, 100 - securityData.risk_score],
          backgroundColor: [getRiskColor(securityData.risk_score), "#e5e7eb"],
          borderColor: [getRiskColor(securityData.risk_score), "#d1d5db"],
          borderWidth: 1,
        },
      ],
    };

    // Create security factors radar chart
    const securityRadarData = {
      labels: ["VPN", "Proxy", "Tor", "Datacenter", "Blacklisted"],
      datasets: [
        {
          label: "Security Factors",
          data: [
            securityData.is_vpn ? 100 : 0,
            securityData.is_proxy ? 100 : 0,
            securityData.is_tor ? 100 : 0,
            securityData.is_datacenter ? 100 : 0,
            securityData.blacklisted ? 100 : 0,
          ],
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Create threat indicators bar chart
    const threatData = {
      labels: ["Abuse Reports", "Recent Attacks", "Blacklist Count"],
      datasets: [
        {
          label: "Threat Indicators",
          data: [
            securityData.abuse_reports,
            securityData.recent_attacks,
            securityData.blacklist_count,
          ],
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };

    // Generate chart images
    const pieImage = await createChartImage(riskPieData, "pie", 200, 200);
    const radarImage = await createChartImage(
      securityRadarData,
      "radar",
      200,
      200
    );
    const barImage = await createChartImage(threatData, "bar", 400, 200);

    // Add charts to PDF
    doc.addImage(pieImage, "PNG", 20, 65, 80, 80);
    doc.addImage(radarImage, "PNG", 110, 65, 80, 80);
    doc.addImage(barImage, "PNG", 20, 155, 170, 85);

    // Add security assessment table
    autoTable(doc, {
      startY: 250,
      head: [["Security Factor", "Status", "Impact"]],
      body: [
        ["VPN", securityData.is_vpn ? "Detected" : "Not Detected", "High"],
        ["Proxy", securityData.is_proxy ? "Detected" : "Not Detected", "High"],
        ["Tor", securityData.is_tor ? "Detected" : "Not Detected", "Critical"],
        [
          "Datacenter",
          securityData.is_datacenter ? "Detected" : "Not Detected",
          "Medium",
        ],
        ["Blacklisted", securityData.blacklisted ? "Yes" : "No", "Critical"],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Add new page for location and network details
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Location & Network Information", 20, 25);

    // Add location details table
    autoTable(doc, {
      startY: 35,
      head: [["Property", "Value"]],
      body: [
        ["Country", ipData.country || "N/A"],
        ["Region", ipData.region || "N/A"],
        ["City", ipData.city || "N/A"],
        ["Postal Code", ipData.postal || "N/A"],
        ["Coordinates", ipData.loc || "N/A"],
        ["Timezone", ipData.timezone || "N/A"],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Add network details table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Network Property", "Value"]],
      body: [
        ["ISP/Organization", ipData.org || "N/A"],
        ["Hostname", ipData.hostname || "N/A"],
        ["IP Type", ipData.bogon ? "Bogon (Reserved/Private)" : "Public"],
        ["IP Version", ipData.ip.includes(":") ? "IPv6" : "IPv4"],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Add new page for recommendations
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Security Recommendations", 20, 25);

    // Add recommendations table
    autoTable(doc, {
      startY: 35,
      head: [["Priority", "Action", "Description"]],
      body: [
        [
          "High",
          "Monitor Traffic",
          "Closely monitor all traffic from this IP address",
        ],
        [
          "High",
          "Implement Verification",
          "Add additional verification steps for this IP",
        ],
        [
          "Medium",
          "Rate Limiting",
          "Consider implementing rate limits for this IP",
        ],
        [
          "Medium",
          "Logging",
          "Enable detailed logging for this IP's activities",
        ],
        [
          "Low",
          "Regular Review",
          "Schedule regular security reviews for this IP",
        ],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Add threat summary
    doc.setFontSize(14);
    doc.text("Threat Summary", 20, doc.lastAutoTable.finalY + 20);

    const threatSummary = [
      `Risk Score: ${securityData.risk_score}/100`,
      `Abuse Reports: ${securityData.abuse_reports}`,
      `Recent Attacks: ${securityData.recent_attacks}`,
      `Blacklist Sources: ${securityData.blacklist_sources.join(", ")}`,
    ];

    threatSummary.forEach((text, index) => {
      doc.setFontSize(10);
      doc.text(text, 20, doc.lastAutoTable.finalY + 35 + index * 7);
    });

    // Add new page for additional information
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Additional Information", 20, 25);

    // Add raw response data
    doc.setFontSize(14);
    doc.text("Raw Response Data", 20, 35);

    // Format the raw data for better readability
    const rawData = JSON.stringify(ipData, null, 2);
    const rawDataLines = doc.splitTextToSize(rawData, 170);

    // Add raw data with proper formatting
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    rawDataLines.forEach((line: string, index: number) => {
      doc.text(line, 20, 45 + index * 4);
    });

    // Add new page for detailed security recommendations
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Detailed Security Recommendations", 20, 25);

    // Add recommendations based on risk score
    doc.setFontSize(12);
    if (securityData.risk_score < 40) {
      doc.setTextColor(40, 167, 69); // Green
      doc.text("Safe IP Score", 20, 35);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        "This IP has been analyzed and appears to be safe. No significant risk factors were detected.",
        20,
        42
      );

      // Add best practices
      doc.setFontSize(12);
      doc.text("Security Best Practices:", 20, 52);
      const bestPractices = [
        "• Keep your systems and applications updated",
        "• Use strong authentication and passwords",
        "• Implement encryption for sensitive data",
        "• Monitor for unusual activity in your logs",
      ];
      bestPractices.forEach((practice, index) => {
        doc.text(practice, 20, 62 + index * 7);
      });
    } else {
      doc.setTextColor(220, 53, 69); // Red
      doc.text("Risk Factors Detected", 20, 35);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `This IP has ${
          securityData.risk_score < 60 ? "some" : "significant"
        } risk factors that should be addressed.`,
        20,
        42
      );

      // Add recommended actions
      doc.setFontSize(12);
      doc.text("Recommended Security Actions:", 20, 52);
      const securityActions = [
        "• Implement additional verification steps",
        "• Monitor all traffic from this IP closely",
        "• Consider restricting access or implementing rate limits",
        "• Check for unusual patterns or behaviors",
      ];
      if (securityData.risk_score > 70) {
        securityActions.push(
          "• Consider blocking this IP if not critical for operations"
        );
      }
      securityActions.forEach((action, index) => {
        doc.text(action, 20, 62 + index * 7);
      });
    }

    // Add new page for IP reputation summary
    doc.addPage();
    doc.setFontSize(16);
    doc.text("IP Reputation Summary", 20, 25);

    // Add blacklist information
    doc.setFontSize(12);
    if (securityData.blacklisted) {
      doc.setTextColor(220, 53, 69); // Red
      doc.text(
        `This IP address is blacklisted on ${securityData.blacklist_count} security lists:`,
        20,
        35
      );
      doc.setFontSize(10);
      securityData.blacklist_sources.forEach((source, index) => {
        doc.text(`• ${source}`, 20, 45 + index * 7);
      });
    } else {
      doc.setTextColor(40, 167, 69); // Green
      doc.text(
        "This IP address is not currently blacklisted on any known security lists.",
        20,
        35
      );
    }

    // Add abuse reports information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "Abuse Reports:",
      20,
      securityData.blacklisted
        ? 45 + securityData.blacklist_sources.length * 7
        : 45
    );
    if (securityData.abuse_reports > 0) {
      doc.setTextColor(255, 193, 7); // Yellow
      doc.text(
        `This IP has been reported for abuse ${securityData.abuse_reports} times recently.`,
        20,
        securityData.blacklisted
          ? 55 + securityData.blacklist_sources.length * 7
          : 55
      );
    } else {
      doc.setTextColor(40, 167, 69); // Green
      doc.text(
        "No abuse reports found for this IP address.",
        20,
        securityData.blacklisted
          ? 55 + securityData.blacklist_sources.length * 7
          : 55
      );
    }

    // Add recent attacks information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "Recent Attacks:",
      20,
      securityData.blacklisted
        ? 65 + securityData.blacklist_sources.length * 7
        : 65
    );
    if (securityData.recent_attacks > 0) {
      doc.setTextColor(220, 53, 69); // Red
      doc.text(
        `This IP has been associated with ${securityData.recent_attacks} attacks recently.`,
        20,
        securityData.blacklisted
          ? 75 + securityData.blacklist_sources.length * 7
          : 75
      );
    } else {
      doc.setTextColor(40, 167, 69); // Green
      doc.text(
        "No recent attacks associated with this IP address.",
        20,
        securityData.blacklisted
          ? 75 + securityData.blacklist_sources.length * 7
          : 75
      );
    }

    // Save the PDF
    doc.save(`ip-security-report-${ipData.ip}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const IpReportPDF: React.FC<IpReportPDFProps> = ({
  ipData,
  securityData,
}) => {
  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={() => generateIpReportPDF(ipData, securityData)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download PDF Report
      </button>
    </div>
  );
};
