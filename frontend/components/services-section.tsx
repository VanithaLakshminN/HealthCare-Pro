import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Pill, MessageSquare, FileText, Clock, Shield, Users, Star } from "lucide-react"

export function ServicesSection() {
  const services = [
    {
      icon: Calendar,
      title: "Doctor Appointments",
      description:
        "Book appointments with certified doctors across various specialties. Available 24/7 with instant confirmation.",
      features: ["Instant booking", "Video consultations", "Specialist doctors", "Flexible scheduling"],
      color: "text-primary",
    },
    {
      icon: Pill,
      title: "Online Pharmacy",
      description:
        "Access a wide range of medicines and healthcare products with doorstep delivery and prescription management.",
      features: ["Prescription upload", "Home delivery", "Medicine reminders", "Genuine products"],
      color: "text-accent",
    },
    {
      icon: MessageSquare,
      title: "AI Health Assistant",
      description: "Get instant health advice, symptom checking, and medical guidance from our advanced AI chatbot.",
      features: ["24/7 availability", "Symptom checker", "Health tips", "Emergency guidance"],
      color: "text-primary",
    },
    {
      icon: FileText,
      title: "Digital Health Records",
      description: "Securely store and manage all your medical records, test results, and health history in one place.",
      features: ["Secure storage", "Easy sharing", "Test results", "Medical history"],
      color: "text-accent",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Complete Healthcare Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need for your health and wellness journey, powered by cutting-edge technology and trusted by
            thousands of patients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-card rounded-lg p-3">
                      <IconComponent className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-card-foreground">{service.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground mb-4 text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary mr-2" />
              <span className="text-3xl font-bold text-foreground">50K+</span>
            </div>
            <p className="text-muted-foreground">Happy Patients</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-accent mr-2" />
              <span className="text-3xl font-bold text-foreground">4.9</span>
            </div>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-primary mr-2" />
              <span className="text-3xl font-bold text-foreground">24/7</span>
            </div>
            <p className="text-muted-foreground">Support Available</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-accent mr-2" />
              <span className="text-3xl font-bold text-foreground">100%</span>
            </div>
            <p className="text-muted-foreground">Secure & Private</p>
          </div>
        </div>
      </div>
    </section>
  )
}
