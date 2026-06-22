"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Star, Video, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AppointmentBooking() {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  const doctors = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.9,
      experience: "15 years",
      location: "Heart Care Center",
      image: "/female-doctor.png",
      consultationFee: "$150",
      availableSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      rating: 4.8,
      experience: "12 years",
      location: "Brain & Spine Clinic",
      image: "/male-doctor.png",
      consultationFee: "$180",
      availableSlots: ["10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"],
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Dermatologist",
      rating: 4.9,
      experience: "10 years",
      location: "Skin Care Institute",
      image: "/female-dermatologist.png",
      consultationFee: "$120",
      availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:30 PM"],
    },
  ]

  const specialties = [
    "Cardiology",
    "Neurology",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
    "Psychiatry",
    "General Medicine",
  ]

  return (
    <section id="appointments" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Book Your Appointment</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Choose from our network of certified doctors and book your appointment instantly. Available for both
            in-person and video consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-card-foreground">Quick Booking</CardTitle>
                <CardDescription>Find and book your appointment in minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="specialty">Select Specialty</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty.toLowerCase()}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="consultation-type">Consultation Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Consultation</SelectItem>
                      <SelectItem value="in-person">In-Person Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Find Available Doctors
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Doctor List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedDoctor === doctor.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedDoctor(doctor.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Doctor Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <img
                          src={doctor.image || "/placeholder.svg"}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-card-foreground">{doctor.name}</h3>
                            <Badge variant="secondary">{doctor.specialty}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span>{doctor.rating}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{doctor.experience}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{doctor.location}</span>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-primary mb-3">
                            Consultation Fee: {doctor.consultationFee}
                          </div>
                        </div>
                      </div>

                      {/* Available Slots */}
                      <div className="md:w-64">
                        <h4 className="font-medium text-card-foreground mb-3">Available Today</h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {doctor.availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedTime === slot ? "default" : "outline"}
                              size="sm"
                              className="text-xs bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTime(slot)
                              }}
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {slot}
                            </Button>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Video className="mr-1 h-4 w-4" />
                            Video
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <MapPin className="mr-1 h-4 w-4" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Book Appointment Button */}
            {selectedDoctor && selectedTime && (
              <div className="mt-8 p-6 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-card-foreground">Ready to book?</h3>
                    <p className="text-sm text-muted-foreground">
                      {doctors.find((d) => d.id === selectedDoctor)?.name} at {selectedTime}
                    </p>
                  </div>
                  <Button size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
