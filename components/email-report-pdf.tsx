import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { EmailDetails, Breach } from "./email-data-breach";
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

interface EmailReportPDFProps {
  emailDetails: EmailDetails;
  breaches: Breach[] | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#1a1a1a",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#2c3e50",
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: "#34495e",
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
  },
});

const createChartImage = async (
  chartData: ChartData,
  type: string,
  width: number,
  height: number
): Promise<string> => {
  // Create a container for the chart
  const container = document.createElement("div");
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  try {
    // Create and render chart
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

    // Wait for chart to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convert to image
    const image = await html2canvas(canvas, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Clean up
    chart.destroy();
    document.body.removeChild(container);

    return image.toDataURL("image/png", 1.0);
  } catch (error) {
    // Clean up in case of error
    document.body.removeChild(container);
    throw error;
  }
};

// Add color helper functions
const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "High":
      return rgbToHex(220, 53, 69); // Red
    case "Medium":
      return rgbToHex(255, 193, 7); // Yellow
    case "Low":
      return rgbToHex(40, 167, 69); // Green
    default:
      return rgbToHex(108, 117, 125); // Gray
  }
};

export const generatePDF = async (
  emailDetails: EmailDetails,
  breaches: Breach[] | null
) => {
  const doc = new jsPDF();

  // Add title and header with increased font size
  doc.setFontSize(22);
  doc.text("Email Security Analysis Report", 105, 20, { align: "center" });

  // Add email details with increased font size
  doc.setFontSize(12);
  doc.text(`Email: ${emailDetails.email}`, 20, 35);
  doc.text(`Analysis Date: ${new Date().toLocaleDateString()}`, 20, 42);

  try {
    // Security Assessment Section with increased font size
    doc.setFontSize(16);
    doc.text("Security Assessment", 20, 55);

    // Create risk score pie chart
    const riskPieData = {
      labels: ["Spam Risk", "Reputation Score"],
      datasets: [
        {
          data: [emailDetails.spamRisk, emailDetails.reputationScore],
          backgroundColor: ["#ff6b6b", "#4ecdc4"],
          borderColor: ["#ff5252", "#45b7af"],
          borderWidth: 1,
        },
      ],
    };

    // Create risk factors radar chart
    const riskRadarData = {
      labels: [
        "Disposable",
        "Free Provider",
        "Deliverable",
        "Malicious",
        "Dark Web",
      ],
      datasets: [
        {
          label: "Risk Factors",
          data: [
            emailDetails.disposable ? 100 : 0,
            emailDetails.free ? 100 : 0,
            emailDetails.deliverable ? 0 : 100,
            emailDetails.maliciousActivity ? 100 : 0,
            emailDetails.darkWebPresence ? 100 : 0,
          ],
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Create security score line chart
    const securityScoreData = {
      labels: ["SPF", "DMARC", "DNS", "Privacy", "Domain Age"],
      datasets: [
        {
          label: "Security Score",
          data: [
            emailDetails.domainDetails.spfRecord ? 100 : 0,
            emailDetails.domainDetails.dmarcRecord ? 100 : 0,
            emailDetails.domainDetails.dnsRecords ? 100 : 0,
            emailDetails.domainDetails.privacyProtection ? 100 : 0,
            calculateDomainAgeScore(emailDetails.domainDetails.createdDate),
          ],
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };

    // Generate chart images with larger dimensions and more spacing
    const pieImage = await createChartImage(riskPieData, "pie", 200, 200);
    const radarImage = await createChartImage(riskRadarData, "radar", 200, 200);
    const lineImage = await createChartImage(
      securityScoreData,
      "line",
      400,
      200
    );

    // Add charts to PDF with more spacing
    doc.addImage(pieImage, "PNG", 20, 65, 80, 80);
    doc.addImage(radarImage, "PNG", 110, 65, 80, 80);
    doc.addImage(lineImage, "PNG", 20, 155, 170, 85);

    // Add risk factors table with increased font size
    autoTable(doc, {
      startY: 250,
      head: [["Risk Factor", "Status", "Impact"]],
      body: [
        ["Disposable Email", emailDetails.disposable ? "Yes" : "No", "High"],
        ["Free Provider", emailDetails.free ? "Yes" : "No", "Medium"],
        ["Deliverable", emailDetails.deliverable ? "Yes" : "No", "High"],
        [
          "Malicious Activity",
          emailDetails.maliciousActivity ? "Detected" : "None",
          "Critical",
        ],
        [
          "Dark Web Presence",
          emailDetails.darkWebPresence ? "Detected" : "None",
          "Critical",
        ],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Add new page for detailed analysis
    doc.addPage();

    // Reputation Analysis Section with increased font size
    doc.setFontSize(16);
    doc.text("Reputation Analysis", 20, 25);

    // Create reputation metrics table with increased font size
    autoTable(doc, {
      startY: 35,
      head: [["Metric", "Score", "Status"]],
      body: [
        [
          "Spam Risk",
          `${emailDetails.spamRisk}/100`,
          getRiskLabel(emailDetails.spamRisk),
        ],
        [
          "Reputation Score",
          `${emailDetails.reputationScore}/100`,
          getReputationLabel(emailDetails.reputationScore),
        ],
        [
          "Domain Age",
          calculateDomainAge(emailDetails.domainDetails.createdDate),
          "Score",
        ],
        ["Security Score", calculateSecurityScore(emailDetails), "Score"],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Technical Details Section with increased font size
    doc.setFontSize(16);
    doc.text("Technical Details", 20, doc.lastAutoTable.finalY + 20);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 30,
      head: [["Property", "Value", "Status"]],
      body: [
        ["Registrar", emailDetails.domainDetails.registrar, "Info"],
        [
          "Created Date",
          new Date(emailDetails.domainDetails.createdDate).toLocaleDateString(),
          "Info",
        ],
        [
          "Expires Date",
          new Date(emailDetails.domainDetails.expiresDate).toLocaleDateString(),
          "Info",
        ],
        [
          "Privacy Protection",
          emailDetails.domainDetails.privacyProtection ? "Enabled" : "Disabled",
          emailDetails.domainDetails.privacyProtection ? "Good" : "Warning",
        ],
        [
          "SPF Record",
          emailDetails.domainDetails.spfRecord ? "Available" : "Missing",
          emailDetails.domainDetails.spfRecord ? "Good" : "Warning",
        ],
        [
          "DMARC Record",
          emailDetails.domainDetails.dmarcRecord ? "Available" : "Missing",
          emailDetails.domainDetails.dmarcRecord ? "Good" : "Warning",
        ],
        [
          "DNS Records",
          emailDetails.domainDetails.dnsRecords ? "Valid" : "Invalid",
          emailDetails.domainDetails.dnsRecords ? "Good" : "Warning",
        ],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Data Breaches Section (if available) with increased font size
    if (breaches && breaches.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Data Breaches Analysis", 20, 25);

      // Create breach severity chart with larger dimensions
      const breachSeverityData = {
        labels: breaches.map((b) => b.Title),
        datasets: [
          {
            label: "Accounts Affected",
            data: breaches.map((b) => b.PwnCount),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      };

      const breachImage = await createChartImage(
        breachSeverityData,
        "bar",
        400,
        200
      );
      doc.addImage(breachImage, "PNG", 20, 35, 170, 85);

      // Add breach details table with increased font size
      autoTable(doc, {
        startY: 130,
        head: [
          [
            "Service",
            "Breach Date",
            "Accounts Affected",
            "Compromised Data",
            "Severity",
          ],
        ],
        body: breaches.map((breach) => [
          breach.Title,
          new Date(breach.BreachDate).toLocaleDateString(),
          breach.PwnCount.toLocaleString(),
          breach.DataClasses.join(", "),
          calculateBreachSeverity(breach),
        ]),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
      });
    }

    // Add recommendations with priority levels and increased font size
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Security Recommendations", 20, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Priority", "Action", "Description"]],
      body: [
        [
          "High",
          "Change Passwords",
          "Change passwords for any breached sites and similar accounts",
        ],
        [
          "High",
          "Enable 2FA",
          "Add two-factor authentication to your accounts",
        ],
        [
          "Medium",
          "Use Password Manager",
          "Create and store strong, unique passwords",
        ],
        [
          "Medium",
          "Monitor Accounts",
          "Regularly check for suspicious activity",
        ],
        [
          "Low",
          "Update Security Settings",
          "Review and update security settings on all accounts",
        ],
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], fontSize: 11, cellPadding: 4 },
    });

    // Add "What should you do now?" section with increased font size
    doc.addPage();
    doc.setFontSize(16);
    doc.text("What should you do now?", 20, 25);

    // Add detailed recommendations with icons
    const recommendations = [
      {
        title: "1. Change your passwords",
        description:
          "Change your passwords for any breached sites and any other sites where you've used the same or similar passwords.",
        priority: "High",
      },
      {
        title: "2. Enable two-factor authentication (2FA)",
        description:
          "Add an extra layer of security to your accounts by enabling two-factor authentication whenever possible.",
        priority: "High",
      },
      {
        title: "3. Use a password manager",
        description:
          "Consider using a password manager to create and store strong, unique passwords for each of your accounts.",
        priority: "Medium",
      },
      {
        title: "4. Monitor your accounts",
        description:
          "Keep an eye on your accounts for any suspicious activity and regularly check your credit reports.",
        priority: "Medium",
      },
    ];

    // Add each recommendation with styling
    let yPosition = 35;
    recommendations.forEach((rec, index) => {
      // Add title
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185); // Blue color for titles
      doc.text(rec.title, 20, yPosition);

      // Add description
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black color for description
      const splitDescription = doc.splitTextToSize(rec.description, 170);
      doc.text(splitDescription, 20, yPosition + 8);

      // Add priority badge
      const priorityColor = getPriorityColor(rec.priority);
      doc.setFillColor(priorityColor);
      doc.roundedRect(150, yPosition - 3, 30, 8, 1, 1, "F");
      doc.setTextColor(255, 255, 255); // White text for badge
      doc.setFontSize(9);
      doc.text(rec.priority, 165, yPosition + 2, { align: "center" });

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Add separator line if not the last item
      if (index < recommendations.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition + 20, 190, yPosition + 20);
      }

      yPosition += 30 + splitDescription.length * 5;
    });

    // Add reference link
    doc.setFontSize(10);
    doc.setTextColor(41, 128, 185);
    doc.textWithLink(
      "Visit HaveIBeenPwned.com for more information",
      20,
      yPosition + 15,
      {
        url: "https://haveibeenpwned.com/",
      }
    );

    // Save the PDF
    doc.save(`email-security-report-${emailDetails.email}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Helper functions
const calculateDomainAgeScore = (createdDate: string) => {
  const age = new Date().getFullYear() - new Date(createdDate).getFullYear();
  return Math.min(age * 20, 100); // Score based on domain age, max 100
};

const calculateDomainAge = (createdDate: string) => {
  const age = new Date().getFullYear() - new Date(createdDate).getFullYear();
  return `${age} years`;
};

const calculateSecurityScore = (emailDetails: EmailDetails) => {
  let score = 0;
  if (emailDetails.domainDetails.spfRecord) score += 25;
  if (emailDetails.domainDetails.dmarcRecord) score += 25;
  if (emailDetails.domainDetails.privacyProtection) score += 25;
  if (emailDetails.domainDetails.dnsRecords) score += 25;
  return score;
};

const calculateBreachSeverity = (breach: Breach) => {
  if (breach.IsSensitive) return "Critical";
  if (breach.PwnCount > 1000000) return "High";
  if (breach.PwnCount > 100000) return "Medium";
  return "Low";
};

const getRiskLabel = (score: number) => {
  if (score < 20) return "Very Low";
  if (score < 40) return "Low";
  if (score < 60) return "Moderate";
  if (score < 80) return "High";
  return "Critical";
};

const getReputationLabel = (score: number) => {
  if (score > 80) return "Excellent";
  if (score > 60) return "Good";
  if (score > 40) return "Fair";
  if (score > 20) return "Poor";
  return "Very Poor";
};

export const EmailReportPDF: React.FC<EmailReportPDFProps> = ({
  emailDetails,
  breaches,
}) => {
  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={() => generatePDF(emailDetails, breaches)}
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
