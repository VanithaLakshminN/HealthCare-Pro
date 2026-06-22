import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Pill, FileText } from "lucide-react"

export function HeroSection() {
  return (
    <section id="home" className="relative py-20 lg:py-32 overflow-hidden h-[92vh]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-8xl font-bold text-foreground mb-6 text-balance">
            Your Complete <span className="text-primary">Digital Healthcare</span> Partner
          </h1>

          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Book appointments with top doctors, access pharmacy services, chat with AI health assistant, and manage your
            digital health records - all in one secure platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-3">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Appointment
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat with AI
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-card rounded-lg p-4 mb-3 inline-block">
                <Calendar className="h-8 w-8 text-primary mx-auto" />
              </div>
              <h3 className="font-semibold text-card-foreground">Book Appointments</h3>
            </div>
            <div className="text-center">
              <div className="bg-card rounded-lg p-4 mb-3 inline-block">
                <Pill className="h-8 w-8 text-accent mx-auto" />
              </div>
              <h3 className="font-semibold text-card-foreground">Online Pharmacy</h3>
            </div>
            <div className="text-center">
              <div className="bg-card rounded-lg p-4 mb-3 inline-block">
                <MessageSquare className="h-8 w-8 text-primary mx-auto" />
              </div>
              <h3 className="font-semibold text-card-foreground">AI Health Chat</h3>
            </div>
            <div className="text-center">
              <div className="bg-card rounded-lg p-4 mb-3 inline-block">
                <FileText className="h-8 w-8 text-accent mx-auto" />
              </div>
              <h3 className="font-semibold text-card-foreground">Health Records</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
