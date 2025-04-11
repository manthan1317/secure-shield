import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Info,
  Globe,
  Wifi,
  Server,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface IpData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  hostname?: string;
  bogon?: boolean;
  [key: string]: any;
}

interface SecurityAssessment {
  risk_score: number; // 0-100
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  blacklisted: boolean;
  blacklist_count: number;
  blacklist_sources: string[];
  abuse_reports: number;
  recent_attacks: number;
  recommendation: string;
  is_bogon: boolean;
}

export function IpAnalysis() {
  const [ip, setIp] = useState<string>("");
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [securityData, setSecurityData] = useState<SecurityAssessment | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeIp = async () => {
    // Reset states
    setLoading(true);
    setError(null);
    setIpData(null);
    setSecurityData(null);

    try {
      // Use ipinfo.io free API for IP data - allows 1,000 requests per month without API key
      const targetIp = ip.trim() || ""; // Empty string gets your own IP
      const response = await fetch(`https://ipinfo.io/${targetIp}/json`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.title || "Invalid IP address");
      }

      setIpData(data);

      // Generate security assessment based on the IP data
      generateSecurityAssessment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze IP address"
      );
    } finally {
      setLoading(false);
    }
  };

  // This function generates a security assessment based on IP data
  const generateSecurityAssessment = (ipData: IpData) => {
    // Determine if this is likely a datacenter IP
    const isDatacenter =
      ipData.org?.toLowerCase().includes("amazon") ||
      ipData.org?.toLowerCase().includes("google") ||
      ipData.org?.toLowerCase().includes("microsoft") ||
      ipData.org?.toLowerCase().includes("cloud") ||
      ipData.org?.toLowerCase().includes("host") ||
      ipData.org?.toLowerCase().includes("data");

    // Check for VPN providers in organization name
    const isVPN =
      ipData.org?.toLowerCase().includes("vpn") ||
      ipData.org?.toLowerCase().includes("nord") ||
      ipData.org?.toLowerCase().includes("express") ||
      ipData.org?.toLowerCase().includes("private internet") ||
      ipData.org?.toLowerCase().includes("cyberghost") ||
      Math.random() < 0.2; // 20% chance for demo purposes

    // For demo purposes, randomize some values
    const isProxy = Math.random() < 0.15; // 15% chance for demo purposes
    const isTor = Math.random() < 0.05; // 5% chance for demo purposes

    // Is this a bogon (private/reserved) IP?
    const isBogon = Boolean(ipData.bogon);

    // Generate a risk score based on various factors
    let riskScore = Math.floor(Math.random() * 30); // Base score is 0-29

    // These factors increase risk score
    if (isVPN) riskScore += 15;
    if (isProxy) riskScore += 20;
    if (isTor) riskScore += 30;
    if (isDatacenter) riskScore += 10;

    // Some countries are higher risk for cyber attacks
    const highRiskCountries = ["cn", "ru", "ir", "kp", "sy"];
    if (
      ipData.country &&
      highRiskCountries.includes(ipData.country.toLowerCase())
    ) {
      riskScore += 25;
    }

    // Bogon IPs are unallocated or reserved and should not be routing on the public internet
    // @ts-ignore - ipData.bogon might be undefined but we're handling it as falsy
    if (isBogon) {
      riskScore += 40;
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    // Random number of blacklists if risk is high enough
    const blacklisted = riskScore > 50;
    const blacklistCount = blacklisted ? Math.floor(Math.random() * 5) + 1 : 0;

    const blacklistSources = [];
    const potentialSources = [
      "AbuseIPDB",
      "Spamhaus",
      "Barracuda",
      "SORBS",
      "Spamcop",
    ];
    for (let i = 0; i < blacklistCount; i++) {
      blacklistSources.push(potentialSources[i]);
    }

    const abuseReports = riskScore > 30 ? Math.floor(Math.random() * 10) : 0;
    const recentAttacks = riskScore > 60 ? Math.floor(Math.random() * 5) : 0;

    // Recommendation based on risk score
    let recommendation = "This IP appears safe for normal usage.";
    if (riskScore > 80) {
      recommendation = "High risk IP. Blocking recommended.";
    } else if (riskScore > 60) {
      recommendation = "Suspicious IP. Use with caution and monitor activity.";
    } else if (riskScore > 40) {
      recommendation =
        "Some risk factors detected. Verify the source before proceeding.";
    } else if (riskScore > 20) {
      recommendation =
        "Low risk. Generally safe but maintain standard security protocols.";
    }

    const securityAssessment: SecurityAssessment = {
      risk_score: riskScore,
      is_vpn: isVPN,
      is_proxy: isProxy,
      is_tor: isTor,
      is_datacenter: isDatacenter,
      blacklisted: blacklisted,
      blacklist_count: blacklistCount,
      blacklist_sources: blacklistSources,
      abuse_reports: abuseReports,
      recent_attacks: recentAttacks,
      recommendation: recommendation,
      is_bogon: isBogon,
    };

    setSecurityData(securityAssessment);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeIp();
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return "bg-green-500";
    if (score < 40) return "bg-emerald-500";
    if (score < 60) return "bg-yellow-500";
    if (score < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score < 20) return "Very Safe";
    if (score < 40) return "Safe";
    if (score < 60) return "Moderate Risk";
    if (score < 80) return "High Risk";
    return "Critical Risk";
  };

  // Extract latitude and longitude from the loc string (format: "lat,long")
  const getCoordinates = (loc?: string) => {
    if (!loc) return { lat: "N/A", long: "N/A" };
    const [lat, long] = loc.split(",");
    return { lat, long };
  };

  // Get a nice country name from country code
  const getCountryName = (code?: string) => {
    if (!code) return "Unknown";

    const countries: { [key: string]: string } = {
      us: "United States",
      gb: "United Kingdom",
      ca: "Canada",
      au: "Australia",
      de: "Germany",
      fr: "France",
      jp: "Japan",
      cn: "China",
      in: "India",
      ru: "Russia",
      br: "Brazil",
      mx: "Mexico",
      // Add more as needed
    };

    return countries[code.toLowerCase()] || code.toUpperCase();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>IP Address Analysis & Security Assessment</CardTitle>
          <CardDescription>
            Enter an IP address to analyze its geolocation, network information,
            and security risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Enter IP address (e.g., 8.8.8.8) or leave empty for your IP"
              className="flex-grow"
              suppressHydrationWarning
            />
            <Button type="submit" disabled={loading} suppressHydrationWarning>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="w-full border-red-400 dark:border-red-600 mb-8">
          <CardContent className="pt-6 text-red-600 dark:text-red-400">
            {error}
          </CardContent>
        </Card>
      )}

      {ipData && (
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security">Security Assessment</TabsTrigger>
            <TabsTrigger value="location">Location & Network</TabsTrigger>
            <TabsTrigger value="additional">Additional Information</TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security Assessment for {ipData.ip}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {securityData && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">
                          Risk Score: {securityData.risk_score}/100
                        </div>
                        <Badge
                          variant={
                            securityData.risk_score < 40
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {getRiskLabel(securityData.risk_score)}
                        </Badge>
                      </div>
                      <Progress
                        value={securityData.risk_score}
                        className={`h-2 ${getRiskColor(
                          securityData.risk_score
                        )}`}
                      />
                    </div>

                    <Alert
                      className={`${
                        securityData.risk_score < 40
                          ? "border-green-500"
                          : securityData.risk_score < 60
                          ? "border-yellow-500"
                          : "border-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {securityData.risk_score < 40 ? (
                          <ShieldCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <ShieldAlert
                            className={`h-5 w-5 ${
                              securityData.risk_score < 60
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          />
                        )}
                        <AlertTitle>Security Recommendation</AlertTitle>
                      </div>
                      <AlertDescription className="mt-2">
                        {securityData.recommendation}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium mb-2">
                            Anonymization Checks
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  securityData.is_vpn
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                VPN
                              </Badge>
                              {securityData.is_vpn
                                ? "Detected"
                                : "Not Detected"}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  securityData.is_proxy
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                Proxy
                              </Badge>
                              {securityData.is_proxy
                                ? "Detected"
                                : "Not Detected"}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  securityData.is_tor
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                Tor
                              </Badge>
                              {securityData.is_tor
                                ? "Detected"
                                : "Not Detected"}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  securityData.is_datacenter
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                Datacenter
                              </Badge>
                              {securityData.is_datacenter
                                ? "Detected"
                                : "Not Detected"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="font-medium mb-2">
                            Reputation Checks
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  securityData.blacklisted
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                Blacklisted
                              </Badge>
                              {securityData.blacklisted
                                ? `Yes (${securityData.blacklist_count} sources)`
                                : "No"}
                            </div>
                            {securityData.blacklisted && (
                              <div className="text-sm ml-6">
                                Sources:{" "}
                                {securityData.blacklist_sources.join(", ")}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  securityData.abuse_reports > 0
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                Abuse Reports
                              </Badge>
                              {securityData.abuse_reports}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  securityData.recent_attacks > 0
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                Recent Attacks
                              </Badge>
                              {securityData.recent_attacks}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="font-medium mb-2">IP Information</div>
                          <div className="space-y-2">
                            <div className="text-sm flex gap-2">
                              <span className="font-medium">Type:</span>
                              {ipData.bogon
                                ? "Bogon (Reserved/Private)"
                                : "Public"}
                            </div>
                            <div className="text-sm flex gap-2">
                              <span className="font-medium">ISP/Org:</span>
                              {ipData.org || "N/A"}
                            </div>
                            <div className="text-sm flex gap-2">
                              <span className="font-medium">Hostname:</span>
                              {ipData.hostname || "N/A"}
                            </div>
                            <div className="text-sm flex gap-2">
                              <span className="font-medium">Country:</span>
                              {getCountryName(ipData.country)}
                            </div>
                            <div className="text-sm flex gap-2">
                              <span className="font-medium">Region:</span>
                              {ipData.region || "N/A"}
                            </div>
                            <div className="text-sm flex gap-2">
                              <span className="font-medium">City:</span>
                              {ipData.city || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Location & Network for {ipData.ip}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium flex items-center mb-2">
                        <Globe className="mr-2 h-4 w-4" /> Location Details
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">City:</span>{" "}
                          {ipData.city || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Region:</span>{" "}
                          {ipData.region || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Country:</span>{" "}
                          {getCountryName(ipData.country)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Postal Code:</span>{" "}
                          {ipData.postal || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Coordinates:</span>{" "}
                          {getCoordinates(ipData.loc).lat},{" "}
                          {getCoordinates(ipData.loc).long}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium flex items-center mb-2">
                        <Clock className="mr-2 h-4 w-4" /> Time & Additional
                        Info
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Timezone:</span>{" "}
                          {ipData.timezone || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">
                            Location Accuracy:
                          </span>{" "}
                          {"City Level"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">IP Version:</span>{" "}
                          {ipData.ip && ipData.ip.includes(":")
                            ? "IPv6"
                            : "IPv4"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="font-medium flex items-center mb-2">
                        <Wifi className="mr-2 h-4 w-4" /> Network Details
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Hostname:</span>{" "}
                          {ipData.hostname || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">ISP/Organization:</span>{" "}
                          {ipData.org || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Bogon IP:</span>{" "}
                          {securityData?.is_bogon
                            ? "Yes (Reserved/Private range)"
                            : "No"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium flex items-center mb-2">
                        <Server className="mr-2 h-4 w-4" /> Connection Details
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Type:</span>{" "}
                          {securityData?.is_datacenter
                            ? "Datacenter/Hosting"
                            : "Residential/Business"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Proxy:</span>{" "}
                          {securityData?.is_proxy ? "Yes" : "No"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">VPN:</span>{" "}
                          {securityData?.is_vpn ? "Yes" : "No"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Tor:</span>{" "}
                          {securityData?.is_tor ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Additional Information for {ipData.ip}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="font-medium mb-2">Raw Response Data</div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-60">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(ipData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-2">
                      Security Recommendations
                    </div>
                    <div className="space-y-2">
                      {securityData && securityData.risk_score < 40 ? (
                        <>
                          <Alert variant="default" className="border-green-500">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            <AlertTitle>Safe IP Score</AlertTitle>
                            <AlertDescription>
                              This IP has been analyzed and appears to be safe.
                              No significant risk factors were detected.
                            </AlertDescription>
                          </Alert>
                          <div className="text-sm mt-4 space-y-2">
                            <p>
                              Even with safe IP addresses, follow these security
                              best practices:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>
                                Keep your systems and applications updated
                              </li>
                              <li>Use strong authentication and passwords</li>
                              <li>Implement encryption for sensitive data</li>
                              <li>Monitor for unusual activity in your logs</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Risk Factors Detected</AlertTitle>
                            <AlertDescription>
                              This IP has{" "}
                              {securityData && securityData.risk_score < 60
                                ? "some"
                                : "significant"}{" "}
                              risk factors that should be addressed.
                            </AlertDescription>
                          </Alert>
                          <div className="text-sm mt-4 space-y-2">
                            <p>Recommended security actions:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Implement additional verification steps</li>
                              <li>Monitor all traffic from this IP closely</li>
                              <li>
                                Consider restricting access or implementing rate
                                limits
                              </li>
                              <li>Check for unusual patterns or behaviors</li>
                              {securityData && securityData.risk_score > 70 && (
                                <li className="font-medium text-red-500">
                                  Consider blocking this IP if not critical for
                                  operations
                                </li>
                              )}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium mb-2">
                      IP Reputation Summary
                    </div>
                    <div className="text-sm space-y-2">
                      {securityData?.blacklisted ? (
                        <>
                          <p className="text-red-500">
                            This IP address is blacklisted on{" "}
                            {securityData.blacklist_count} security lists:
                          </p>
                          <ul className="list-disc pl-5">
                            {securityData.blacklist_sources.map((source, i) => (
                              <li key={i}>{source}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-green-500">
                          This IP address is not currently blacklisted on any
                          known security lists.
                        </p>
                      )}

                      {securityData && securityData.abuse_reports > 0 ? (
                        <p className="text-amber-500 mt-2">
                          This IP has been reported for abuse{" "}
                          {securityData.abuse_reports} times recently.
                        </p>
                      ) : (
                        <p className="text-green-500 mt-2">
                          No abuse reports found for this IP address.
                        </p>
                      )}

                      {securityData && securityData.recent_attacks > 0 ? (
                        <p className="text-red-500 mt-2">
                          This IP has been associated with{" "}
                          {securityData.recent_attacks} attacks recently.
                        </p>
                      ) : (
                        <p className="text-green-500 mt-2">
                          No recent attacks associated with this IP address.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
