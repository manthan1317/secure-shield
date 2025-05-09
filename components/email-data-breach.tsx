import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Loader2,
  Shield,
  AlertCircle,
  Calendar,
  Globe,
  Database,
  Lock,
  ExternalLink,
  Mail,
  Info,
  CheckCircle,
  XCircle,
  User,
  AtSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EmailReportPDF } from "./email-report-pdf";

// Simulated breach data structure based on the haveibeenpwned API format
interface Breach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
}

// Extended email details for comprehensive analysis
interface EmailDetails {
  email: string;
  domain: string;
  username: string;
  firstSeen: string;
  lastSeen: string;
  breachCount: number;
  disposable: boolean;
  free: boolean;
  commercial: boolean;
  deliverable: boolean;
  spamRisk: number;
  reputationScore: number;
  maliciousActivity: boolean;
  darkWebPresence: boolean;
  relatedEmails: string[];
  relatedPhones: string[];
  dataPoints: {
    category: string;
    items: string[];
  }[];
  domainDetails: {
    registrar: string;
    createdDate: string;
    expiresDate: string;
    privacyProtection: boolean;
    dnsRecords: boolean;
    spfRecord: boolean;
    dmarcRecord: boolean;
  };
}

export const EmailDataBreach = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breaches, setBreaches] = useState<Breach[] | null>(null);
  const [safeEmail, setSafeEmail] = useState(false);
  const [emailDetails, setEmailDetails] = useState<EmailDetails | null>(null);

  const checkEmail = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setBreaches(null);
    setSafeEmail(false);
    setEmailDetails(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate detailed email analysis
      const details = generateEmailDetails(email);
      setEmailDetails(details);

      // Simulate response based on the email domain
      if (
        email.toLowerCase().includes("test") ||
        email.toLowerCase().includes("breach")
      ) {
        const mockBreaches = generateMockBreaches();
        setBreaches(mockBreaches);
      } else {
        setSafeEmail(true);
      }
    } catch (err) {
      setError("An error occurred while checking the email. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate detailed email analysis
  const generateEmailDetails = (emailAddress: string): EmailDetails => {
    const [username, domain] = emailAddress.split("@");

    // Check if domain is a common free email provider
    const freeEmailProviders = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "protonmail.com",
      "mail.com",
      "icloud.com",
    ];
    const isFree = freeEmailProviders.includes(domain.toLowerCase());

    // Check if domain might be disposable
    const disposableDomains = [
      "tempmail.com",
      "throwaway.com",
      "mailinator.com",
      "temp-mail.org",
      "10minutemail.com",
      "guerrillamail.com",
    ];
    const isDisposable =
      disposableDomains.includes(domain.toLowerCase()) ||
      domain.toLowerCase().includes("temp") ||
      domain.toLowerCase().includes("disposable");

    // Generate spam risk score based on various factors
    let spamRisk = Math.floor(Math.random() * 30); // Base score

    // Username factors that might increase spam risk
    if (
      username.includes("admin") ||
      username.includes("info") ||
      username.includes("contact")
    ) {
      spamRisk += 10;
    }
    if (username.length < 5) {
      spamRisk += 15;
    }
    if (/\d{4,}/.test(username)) {
      // Contains 4+ consecutive digits
      spamRisk += 20;
    }

    // Domain factors
    if (isDisposable) {
      spamRisk += 50;
    }

    // Cap at 100
    spamRisk = Math.min(spamRisk, 100);

    // Reputation is inverse of spam risk with some randomness
    const reputationScore = Math.max(
      0,
      100 - spamRisk - Math.floor(Math.random() * 20)
    );

    // Generate plausible dates
    const now = new Date();
    const firstSeenDate = new Date(now);
    firstSeenDate.setMonth(now.getMonth() - Math.floor(Math.random() * 36)); // Random date in the past 3 years

    const lastSeenDate = new Date(firstSeenDate);
    lastSeenDate.setDate(
      firstSeenDate.getDate() +
        Math.floor(
          (Math.random() * (now.getTime() - firstSeenDate.getTime())) /
            (1000 * 60 * 60 * 24)
        )
    );

    // Generate domain registration dates
    const domainCreatedDate = new Date(now);
    domainCreatedDate.setFullYear(
      now.getFullYear() - Math.floor(Math.random() * 15) - 1
    ); // 1-15 years ago

    const domainExpiresDate = new Date(now);
    domainExpiresDate.setFullYear(
      now.getFullYear() + Math.floor(Math.random() * 5) + 1
    ); // 1-5 years in future

    // Generate mock related data points based on email
    const dataCategories = [
      {
        category: "Personal Information",
        items:
          username.length > 5 ? ["Full Name", "Date of Birth"] : ["Username"],
      },
      {
        category: "Contact Details",
        items: ["Email Address"],
      },
      {
        category: "Online Accounts",
        items: ["Social Media Profiles", "Forum Accounts"],
      },
      {
        category: "Digital Footprint",
        items: ["IP Addresses", "Device Information"],
      },
    ];

    // If email seems risky, add more concerning data categories
    if (spamRisk > 50) {
      dataCategories.push({
        category: "Financial Information",
        items: ["Payment Methods", "Billing Addresses"],
      });
    }

    return {
      email: emailAddress,
      domain: domain,
      username: username,
      firstSeen: firstSeenDate.toISOString().split("T")[0],
      lastSeen: lastSeenDate.toISOString().split("T")[0],
      breachCount:
        email.toLowerCase().includes("test") ||
        email.toLowerCase().includes("breach")
          ? 3
          : 0,
      disposable: isDisposable,
      free: isFree,
      commercial: !isFree && !isDisposable,
      deliverable: Math.random() > 0.1, // 90% chance email is deliverable
      spamRisk: spamRisk,
      reputationScore: reputationScore,
      maliciousActivity: spamRisk > 70,
      darkWebPresence:
        email.toLowerCase().includes("test") ||
        email.toLowerCase().includes("breach"),
      relatedEmails: [
        username + ".backup@" + domain,
        username + "2@" + domain,
        username + "@gmail.com",
      ],
      relatedPhones: [],
      dataPoints: dataCategories,
      domainDetails: {
        registrar: isFree ? "Major Provider" : "GoDaddy",
        createdDate: domainCreatedDate.toISOString().split("T")[0],
        expiresDate: domainExpiresDate.toISOString().split("T")[0],
        privacyProtection: Math.random() > 0.3, // 70% chance of privacy protection
        dnsRecords: true,
        spfRecord: Math.random() > 0.2, // 80% chance of SPF
        dmarcRecord: Math.random() > 0.4, // 60% chance of DMARC
      },
    };
  };

  const generateMockBreaches = (): Breach[] => {
    // Create some realistic looking breach data
    return [
      {
        Name: "adobe",
        Title: "Adobe",
        Domain: "adobe.com",
        BreachDate: "2013-10-04",
        AddedDate: "2013-12-04T00:00:00Z",
        ModifiedDate: "2022-05-15T23:52:43Z",
        PwnCount: 152445165,
        Description:
          "In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text. The password cryptography was poorly done and many were quickly resolved back to plain text.",
        LogoPath:
          "https://haveibeenpwned.com/Content/Images/PwnedLogos/Adobe.png",
        DataClasses: [
          "Email addresses",
          "Password hints",
          "Passwords",
          "Usernames",
        ],
        IsVerified: true,
        IsFabricated: false,
        IsSensitive: false,
        IsRetired: false,
        IsSpamList: false,
        IsMalware: false,
      },
      {
        Name: "linkedin",
        Title: "LinkedIn",
        Domain: "linkedin.com",
        BreachDate: "2012-05-05",
        AddedDate: "2016-05-21T21:35:40Z",
        ModifiedDate: "2022-11-06T23:58:42Z",
        PwnCount: 164611595,
        Description:
          "In May 2016, LinkedIn had 164 million email addresses and passwords exposed. Originally hacked in 2012, the data remained out of sight until being offered for sale on a dark market site 4 years later. The passwords were stored as SHA1 hashes without salt, and the vast majority were quickly cracked.",
        LogoPath:
          "https://haveibeenpwned.com/Content/Images/PwnedLogos/LinkedIn.png",
        DataClasses: ["Email addresses", "Passwords"],
        IsVerified: true,
        IsFabricated: false,
        IsSensitive: false,
        IsRetired: false,
        IsSpamList: false,
        IsMalware: false,
      },
      {
        Name: "dropbox",
        Title: "Dropbox",
        Domain: "dropbox.com",
        BreachDate: "2012-07-01",
        AddedDate: "2016-08-31T00:19:19Z",
        ModifiedDate: "2022-05-15T23:52:50Z",
        PwnCount: 68648009,
        Description:
          "In mid-2012, Dropbox suffered a data breach which exposed the stored credentials of tens of millions of their customers. In August 2016, they forced password resets for customers they believed may be at risk. The data contained email addresses and salted hashes of passwords.",
        LogoPath:
          "https://haveibeenpwned.com/Content/Images/PwnedLogos/Dropbox.png",
        DataClasses: ["Email addresses", "Passwords"],
        IsVerified: true,
        IsFabricated: false,
        IsSensitive: false,
        IsRetired: false,
        IsSpamList: false,
        IsMalware: false,
      },
    ];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkEmail();
  };

  // Get color for risk score
  const getRiskColor = (score: number) => {
    if (score < 20) return "bg-green-500";
    if (score < 40) return "bg-emerald-500";
    if (score < 60) return "bg-yellow-500";
    if (score < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get label for risk level
  const getRiskLabel = (score: number) => {
    if (score < 20) return "Very Low";
    if (score < 40) return "Low";
    if (score < 60) return "Moderate";
    if (score < 80) return "High";
    return "Critical";
  };

  // Get color for reputation score
  const getReputationColor = (score: number) => {
    if (score > 80) return "bg-green-500";
    if (score > 60) return "bg-emerald-500";
    if (score > 40) return "bg-yellow-500";
    if (score > 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get label for reputation level
  const getReputationLabel = (score: number) => {
    if (score > 80) return "Excellent";
    if (score > 60) return "Good";
    if (score > 40) return "Fair";
    if (score > 20) return "Poor";
    return "Very Poor";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle>Email Data Breach & Security Analyzer</CardTitle>
          <CardDescription>
            Check if your email has been involved in data breaches and analyze
            its security profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
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
                "Analyze Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6 w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {emailDetails && (
        <Tabs defaultValue="overview" className="w-full mb-8">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breaches">Data Breaches</TabsTrigger>
              <TabsTrigger value="reputation">Reputation</TabsTrigger>
              <TabsTrigger value="details">Technical Details</TabsTrigger>
            </TabsList>
          </div>
          <EmailReportPDF emailDetails={emailDetails} breaches={breaches} />

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Analysis for {emailDetails.email}
                  </CardTitle>
                  <Badge
                    variant={
                      emailDetails.breachCount > 0 ? "destructive" : "outline"
                    }
                    className="ml-2"
                  >
                    {emailDetails.breachCount > 0
                      ? `${emailDetails.breachCount} Breaches Found`
                      : "No Breaches Found"}
                  </Badge>
                </div>
                <CardDescription>
                  Comprehensive analysis and risk assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Email Identity
                      </h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm font-medium">Username:</div>
                        <div className="text-sm">{emailDetails.username}</div>

                        <div className="text-sm font-medium">Domain:</div>
                        <div className="text-sm">{emailDetails.domain}</div>

                        <div className="text-sm font-medium">First Seen:</div>
                        <div className="text-sm">
                          {formatDate(emailDetails.firstSeen)}
                        </div>

                        <div className="text-sm font-medium">
                          Last Activity:
                        </div>
                        <div className="text-sm">
                          {formatDate(emailDetails.lastSeen)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Security Assessment
                      </h3>
                      <div className="space-y-2 mt-2">
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="text-sm font-medium">
                              Spam Risk:
                            </div>
                            <div className="text-sm">
                              {getRiskLabel(emailDetails.spamRisk)}
                            </div>
                          </div>
                          <Progress
                            value={emailDetails.spamRisk}
                            className={`h-2 ${getRiskColor(
                              emailDetails.spamRisk
                            )}`}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="text-sm font-medium">
                              Reputation:
                            </div>
                            <div className="text-sm">
                              {getReputationLabel(emailDetails.reputationScore)}
                            </div>
                          </div>
                          <Progress
                            value={emailDetails.reputationScore}
                            className={`h-2 ${getReputationColor(
                              emailDetails.reputationScore
                            )}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Risk Factors
                      </h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm font-medium">
                          Disposable Email:
                        </div>
                        <div className="text-sm flex items-center">
                          {emailDetails.disposable ? (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                              Yes
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              No
                            </>
                          )}
                        </div>

                        <div className="text-sm font-medium">
                          Free Provider:
                        </div>
                        <div className="text-sm flex items-center">
                          {emailDetails.free ? (
                            <>
                              <Info className="h-4 w-4 text-blue-500 mr-1" />{" "}
                              Yes
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              No
                            </>
                          )}
                        </div>

                        <div className="text-sm font-medium">Deliverable:</div>
                        <div className="text-sm flex items-center">
                          {emailDetails.deliverable ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              Yes
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                              No
                            </>
                          )}
                        </div>

                        <div className="text-sm font-medium">
                          Malicious Activity:
                        </div>
                        <div className="text-sm flex items-center">
                          {emailDetails.maliciousActivity ? (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                              Detected
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              None
                            </>
                          )}
                        </div>

                        <div className="text-sm font-medium">
                          Dark Web Presence:
                        </div>
                        <div className="text-sm flex items-center">
                          {emailDetails.darkWebPresence ? (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                              Detected
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              None
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Alert
                      className={
                        emailDetails.breachCount > 0
                          ? "border-red-500"
                          : "border-green-500"
                      }
                    >
                      <div className="flex items-center gap-2">
                        {emailDetails.breachCount > 0 ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <AlertTitle>
                          {emailDetails.breachCount > 0
                            ? `Found in ${emailDetails.breachCount} data breaches`
                            : "No data breaches found"}
                        </AlertTitle>
                      </div>
                      <AlertDescription className="mt-2">
                        {emailDetails.breachCount > 0
                          ? "This email has appeared in data breaches. Check the 'Data Breaches' tab for details."
                          : "Good news! This email hasn't been found in any known data breaches."}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Data Exposure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emailDetails.dataPoints.map((category, idx) => (
                      <Card key={idx} className="p-4">
                        <h4 className="text-md font-medium mb-2">
                          {category.category}
                        </h4>
                        <ul className="space-y-1">
                          {category.items.map((item, i) => (
                            <li key={i} className="text-sm flex items-center">
                              <Info className="h-3 w-3 mr-1 text-blue-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breaches">
            {breaches && breaches.length > 0 ? (
              <div className="w-full space-y-6">
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    Email found in {breaches.length} data breaches!
                  </AlertTitle>
                  <AlertDescription>
                    The email address {email} was found in {breaches.length}{" "}
                    known data breaches. Check the details below and consider
                    changing your passwords.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6">
                  {breaches.map((breach) => (
                    <Card key={breach.Name} className="w-full overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                              {breach.Title}
                              {breach.IsSensitive && (
                                <Badge variant="destructive" className="ml-2">
                                  Sensitive
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Globe className="h-3.5 w-3.5 mr-1" />
                              {breach.Domain}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(breach.BreachDate)}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Database className="h-3 w-3 inline mr-1" />
                              {breach.PwnCount.toLocaleString()} accounts
                              affected
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <div className="space-y-4">
                          <p className="text-sm">{breach.Description}</p>

                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <Lock className="h-4 w-4 mr-1" />
                              Compromised Data:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {breach.DataClasses.map((dataClass) => (
                                <Badge key={dataClass} variant="secondary">
                                  {dataClass}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Alert className="border-green-500">
                <Shield className="h-4 w-4 text-green-500" />
                <AlertTitle>Good news!</AlertTitle>
                <AlertDescription>
                  No breaches found for {email}. This email hasn't appeared in
                  any known data breaches.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="reputation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Reputation Analysis for {emailDetails.email}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">
                          Spam Risk Score: {emailDetails.spamRisk}/100
                        </div>
                        <Badge
                          variant={
                            emailDetails.spamRisk < 40
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {getRiskLabel(emailDetails.spamRisk)}
                        </Badge>
                      </div>
                      <Progress
                        value={emailDetails.spamRisk}
                        className={`h-2 ${getRiskColor(emailDetails.spamRisk)}`}
                      />
                    </div>

                    <Alert
                      className={`${
                        emailDetails.spamRisk < 40
                          ? "border-green-500"
                          : emailDetails.spamRisk < 60
                          ? "border-yellow-500"
                          : "border-red-500"
                      }`}
                    >
                      <AlertTitle>Risk Assessment</AlertTitle>
                      <AlertDescription className="mt-2">
                        {emailDetails.spamRisk < 30
                          ? "This email has a low spam risk score and appears to be legitimate."
                          : emailDetails.spamRisk < 60
                          ? "This email has some risk factors that could be concerning."
                          : "This email has a high spam risk score and may be problematic."}
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Risk Factors</h3>
                      <ul className="space-y-2">
                        {emailDetails.disposable && (
                          <li className="text-sm flex items-center text-red-500">
                            <XCircle className="h-4 w-4 mr-2" />
                            Disposable email service detected
                          </li>
                        )}
                        {!emailDetails.deliverable && (
                          <li className="text-sm flex items-center text-red-500">
                            <XCircle className="h-4 w-4 mr-2" />
                            Email may not be deliverable
                          </li>
                        )}
                        {emailDetails.maliciousActivity && (
                          <li className="text-sm flex items-center text-red-500">
                            <XCircle className="h-4 w-4 mr-2" />
                            Associated with malicious activity
                          </li>
                        )}
                        {emailDetails.darkWebPresence && (
                          <li className="text-sm flex items-center text-red-500">
                            <XCircle className="h-4 w-4 mr-2" />
                            Found on dark web forums or marketplaces
                          </li>
                        )}
                        {emailDetails.free && (
                          <li className="text-sm flex items-center text-yellow-500">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Free email provider (lower security than business
                            email)
                          </li>
                        )}
                        {emailDetails.breachCount > 0 && (
                          <li className="text-sm flex items-center text-red-500">
                            <XCircle className="h-4 w-4 mr-2" />
                            Involved in {emailDetails.breachCount} data breaches
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">
                          Reputation Score: {emailDetails.reputationScore}/100
                        </div>
                        <Badge
                          variant={
                            emailDetails.reputationScore > 60
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {getReputationLabel(emailDetails.reputationScore)}
                        </Badge>
                      </div>
                      <Progress
                        value={emailDetails.reputationScore}
                        className={`h-2 ${getReputationColor(
                          emailDetails.reputationScore
                        )}`}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Domain Reputation
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">SPF Record:</div>
                        <div className="text-sm flex items-center">
                          {emailDetails.domainDetails.spfRecord ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              Available
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                              Missing
                            </>
                          )}
                        </div>

                        <div className="text-sm font-medium">DMARC Record:</div>
                        <div className="text-sm flex items-center">
                          {emailDetails.domainDetails.dmarcRecord ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              Available
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                              Missing
                            </>
                          )}
                        </div>

                        <div className="text-sm font-medium">
                          Privacy Protection:
                        </div>
                        <div className="text-sm flex items-center">
                          {emailDetails.domainDetails.privacyProtection ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                              Enabled
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                              Disabled
                            </>
                          )}
                        </div>

                        <div className="text-sm font-medium">Registrar:</div>
                        <div className="text-sm">
                          {emailDetails.domainDetails.registrar}
                        </div>

                        <div className="text-sm font-medium">Domain Age:</div>
                        <div className="text-sm">
                          {formatDate(emailDetails.domainDetails.createdDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Technical Details for {emailDetails.email}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Email Structure
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Local Part:</div>
                        <div className="text-sm font-mono">
                          {emailDetails.username}
                        </div>

                        <div className="text-sm font-medium">Domain:</div>
                        <div className="text-sm font-mono">
                          {emailDetails.domain}
                        </div>

                        <div className="text-sm font-medium">Format:</div>
                        <div className="text-sm font-mono">
                          {emailDetails.username}@{emailDetails.domain}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Timeline</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">First Seen:</div>
                        <div className="text-sm">
                          {formatDate(emailDetails.firstSeen)}
                        </div>

                        <div className="text-sm font-medium">Last Seen:</div>
                        <div className="text-sm">
                          {formatDate(emailDetails.lastSeen)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Related Information
                      </h3>
                      {emailDetails.relatedEmails.length > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium">
                            Related Emails:
                          </div>
                          <ul className="list-disc pl-5 space-y-1 mt-1">
                            {emailDetails.relatedEmails.map(
                              (relatedEmail, i) => (
                                <li key={i} className="text-sm">
                                  {relatedEmail}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Domain Information
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Registrar:</div>
                        <div className="text-sm">
                          {emailDetails.domainDetails.registrar}
                        </div>

                        <div className="text-sm font-medium">
                          Registration Date:
                        </div>
                        <div className="text-sm">
                          {formatDate(emailDetails.domainDetails.createdDate)}
                        </div>

                        <div className="text-sm font-medium">
                          Expiration Date:
                        </div>
                        <div className="text-sm">
                          {formatDate(emailDetails.domainDetails.expiresDate)}
                        </div>

                        <div className="text-sm font-medium">
                          Privacy Protection:
                        </div>
                        <div className="text-sm">
                          {emailDetails.domainDetails.privacyProtection
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Email Security
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-1/2 text-sm font-medium">
                            SPF Record:
                          </div>
                          <div className="w-1/2 text-sm flex items-center">
                            {emailDetails.domainDetails.spfRecord ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                                Missing
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-1/2 text-sm font-medium">
                            DMARC Record:
                          </div>
                          <div className="w-1/2 text-sm flex items-center">
                            {emailDetails.domainDetails.dmarcRecord ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                                Missing
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-1/2 text-sm font-medium">
                            DNS Records:
                          </div>
                          <div className="w-1/2 text-sm flex items-center">
                            {emailDetails.domainDetails.dnsRecords ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />{" "}
                                Valid
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />{" "}
                                Invalid
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Raw Data (Simulated)
                  </h3>
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-60">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(emailDetails, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {emailDetails && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>What should you do now?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  1. Change your passwords
                </h3>
                <p className="text-sm">
                  Change your passwords for any breached sites and any other
                  sites where you've used the same or similar passwords.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  2. Enable two-factor authentication (2FA)
                </h3>
                <p className="text-sm">
                  Add an extra layer of security to your accounts by enabling
                  two-factor authentication whenever possible.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  3. Use a password manager
                </h3>
                <p className="text-sm">
                  Consider using a password manager to create and store strong,
                  unique passwords for each of your accounts.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  4. Monitor your accounts
                </h3>
                <p className="text-sm">
                  Keep an eye on your accounts for any suspicious activity and
                  regularly check your credit reports.
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="https://haveibeenpwned.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 flex items-center hover:underline"
                >
                  Visit HaveIBeenPwned.com for more information
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
