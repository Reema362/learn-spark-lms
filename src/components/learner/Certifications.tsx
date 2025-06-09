
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Eye, Calendar, ExternalLink } from 'lucide-react';

const Certifications = () => {
  const certificates = [
    {
      id: 1,
      title: "Phishing Awareness Certification",
      courseTitle: "Phishing Awareness Training",
      issueDate: "2024-01-10",
      expiryDate: "2025-01-10",
      certificateId: "PAC-2024-001",
      status: "valid",
      credentialUrl: "#"
    },
    {
      id: 2,
      title: "Security Awareness Fundamentals",
      courseTitle: "Cybersecurity Fundamentals",
      issueDate: "2023-11-15",
      expiryDate: "2024-11-15",
      certificateId: "SAF-2023-045",
      status: "expiring-soon",
      credentialUrl: "#"
    }
  ];

  const availableCertifications = [
    {
      title: "Data Protection Specialist",
      courseTitle: "Data Protection and Privacy",
      requiredProgress: 100,
      currentProgress: 0,
      estimatedCompletion: "2024-02-01"
    },
    {
      title: "Incident Response Professional",
      courseTitle: "Incident Response Procedures",
      requiredProgress: 100,
      currentProgress: 40,
      estimatedCompletion: "2024-01-25"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-success text-success-foreground">Valid</Badge>;
      case 'expiring-soon':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Certifications</h2>
        <p className="text-muted-foreground">View and manage your earned certificates</p>
      </div>

      {/* Earned Certificates */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Earned Certificates
          </CardTitle>
          <CardDescription>Certificates you have successfully earned</CardDescription>
        </CardHeader>
        <CardContent>
          {certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">Certificate ID: {cert.certificateId}</p>
                    </div>
                    {getStatusBadge(cert.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Verify Online
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No certificates earned yet</p>
              <p className="text-sm text-muted-foreground">Complete courses to earn your first certificate</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Certifications */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Available Certifications</CardTitle>
          <CardDescription>Certificates you can earn by completing assigned courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableCertifications.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground">{cert.courseTitle}</p>
                  </div>
                  <Badge variant="outline">
                    {cert.currentProgress}% Complete
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{cert.currentProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${cert.currentProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Estimated completion: {new Date(cert.estimatedCompletion).toLocaleDateString()}
                  </span>
                  {cert.currentProgress === 100 ? (
                    <Button size="sm">
                      <Award className="h-4 w-4 mr-2" />
                      Claim Certificate
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      Continue Course
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-success">{certificates.length}</div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </CardContent>
        </Card>
        <Card className="stats-card text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">
              {certificates.filter(c => c.status === 'expiring-soon').length}
            </div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </CardContent>
        </Card>
        <Card className="stats-card text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">{availableCertifications.length}</div>
            <div className="text-sm text-muted-foreground">Available to Earn</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Certifications;
