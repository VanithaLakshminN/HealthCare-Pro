"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Download,
  Share2,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Eye,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

export function HealthRecords() {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)

  const medicalRecords = [
    {
      id: "1",
      type: "Lab Results",
      title: "Complete Blood Count (CBC)",
      date: "2024-01-15",
      doctor: "Dr. Sarah Johnson",
      status: "Normal",
      priority: "normal",
      summary: "All blood parameters within normal range",
    },
    {
      id: "2",
      type: "Prescription",
      title: "Blood Pressure Medication",
      date: "2024-01-10",
      doctor: "Dr. Michael Chen",
      status: "Active",
      priority: "high",
      summary: "Lisinopril 10mg daily for hypertension management",
    },
    {
      id: "3",
      type: "Imaging",
      title: "Chest X-Ray",
      date: "2024-01-05",
      doctor: "Dr. Emily Rodriguez",
      status: "Normal",
      priority: "normal",
      summary: "Clear lung fields, no abnormalities detected",
    },
    {
      id: "4",
      type: "Visit Summary",
      title: "Annual Physical Exam",
      date: "2023-12-20",
      doctor: "Dr. Sarah Johnson",
      status: "Completed",
      priority: "normal",
      summary: "Routine checkup with recommendations for lifestyle improvements",
    },
  ]

  const vitalSigns = [
    {
      metric: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      trend: "stable",
      lastUpdated: "2024-01-15",
      icon: Heart,
    },
    {
      metric: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "normal",
      trend: "stable",
      lastUpdated: "2024-01-15",
      icon: Activity,
    },
    {
      metric: "Temperature",
      value: "98.6",
      unit: "°F",
      status: "normal",
      trend: "stable",
      lastUpdated: "2024-01-15",
      icon: Thermometer,
    },
    {
      metric: "Weight",
      value: "165",
      unit: "lbs",
      status: "normal",
      trend: "decreasing",
      lastUpdated: "2024-01-15",
      icon: Weight,
    },
  ]

  const healthGoals = [
    {
      id: "1",
      title: "Weight Management",
      target: "Lose 10 lbs",
      progress: 60,
      deadline: "2024-06-01",
      status: "on-track",
    },
    {
      id: "2",
      title: "Exercise Routine",
      target: "150 min/week",
      progress: 80,
      deadline: "Ongoing",
      status: "on-track",
    },
    {
      id: "3",
      title: "Blood Pressure Control",
      target: "< 130/80 mmHg",
      progress: 90,
      deadline: "Ongoing",
      status: "achieved",
    },
    {
      id: "4",
      title: "Medication Adherence",
      target: "100% compliance",
      progress: 95,
      deadline: "Ongoing",
      status: "on-track",
    },
  ]

  const upcomingAppointments = [
    {
      id: "1",
      type: "Follow-up",
      doctor: "Dr. Sarah Johnson",
      date: "2024-02-15",
      time: "10:00 AM",
      purpose: "Blood pressure check",
    },
    {
      id: "2",
      type: "Specialist",
      doctor: "Dr. Robert Kim",
      date: "2024-02-20",
      time: "2:30 PM",
      purpose: "Cardiology consultation",
    },
    {
      id: "3",
      type: "Lab Work",
      doctor: "LabCorp",
      date: "2024-03-01",
      time: "9:00 AM",
      purpose: "Quarterly blood work",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "normal":
      case "completed":
      case "achieved":
        return "bg-green-500/10 text-green-700 border-green-200"
      case "active":
      case "on-track":
        return "bg-blue-500/10 text-blue-700 border-blue-200"
      case "high":
      case "urgent":
        return "bg-red-500/10 text-red-700 border-red-200"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  return (
    <section id="health-records" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Digital Health Records</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Access your complete medical history, track vital signs, monitor health goals, and manage appointments all
            in one secure platform.
          </p>
        </div>

        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="goals">Health Goals</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Medical Records</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export All
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {medicalRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{record.title}</CardTitle>
                          <CardDescription>{record.type}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{record.summary}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {record.date}
                        </span>
                        <span>{record.doctor}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Vital Signs</h3>
              <Button variant="outline" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Trends
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vitalSigns.map((vital, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <vital.icon className="h-6 w-6 text-primary" />
                      {getTrendIcon(vital.trend)}
                    </div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">{vital.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {vital.value}
                      <span className="text-sm font-normal text-muted-foreground ml-1">{vital.unit}</span>
                    </div>
                    <Badge className={getStatusColor(vital.status)} variant="outline">
                      {vital.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      <Clock className="inline mr-1 h-3 w-3" />
                      {vital.lastUpdated}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your health data is encrypted and stored securely. Only you and authorized healthcare providers can
                  access your information. All data transmission is protected with industry-standard security protocols.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Health Goals</h3>
              <Button size="sm">Add New Goal</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                    </div>
                    <CardDescription>{goal.target}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Deadline: {goal.deadline}</span>
                        {goal.status === "achieved" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : goal.progress < 50 ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">Upcoming Appointments</h3>
              <Button size="sm">Schedule New</Button>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                          <span className="text-lg font-bold text-primary">{new Date(appointment.date).getDate()}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{appointment.doctor}</h4>
                          <p className="text-sm text-muted-foreground">{appointment.purpose}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant="outline">{appointment.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              <Clock className="inline mr-1 h-3 w-3" />
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
