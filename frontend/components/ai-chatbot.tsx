"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2, X, Stethoscope, Clock, Heart, Brain } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "suggestion"
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI health assistant. I can help you with medical questions, symptom checking, medication information, and general health guidance. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickSuggestions = [
    { icon: Stethoscope, text: "Check symptoms", query: "I have a headache and fever" },
    { icon: Heart, text: "Heart health tips", query: "How can I improve my heart health?" },
    { icon: Brain, text: "Mental wellness", query: "Tips for managing stress and anxiety" },
    { icon: Clock, text: "Medication reminders", query: "How to set up medication reminders?" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true)

    setTimeout(() => {
      let botResponse = ""

      if (userMessage.toLowerCase().includes("headache") || userMessage.toLowerCase().includes("fever")) {
        botResponse =
          "I understand you're experiencing a headache and fever. These symptoms could indicate various conditions. Here are some general recommendations:\n\n• Rest and stay hydrated\n• Consider over-the-counter pain relievers like acetaminophen\n• Monitor your temperature\n• If symptoms persist for more than 2-3 days or worsen, please consult a healthcare provider\n\n⚠️ This is general information only. For personalized medical advice, please consult with a healthcare professional."
      } else if (userMessage.toLowerCase().includes("heart health")) {
        botResponse =
          "Great question! Here are evidence-based tips for heart health:\n\n• Regular exercise (150 minutes moderate activity per week)\n• Eat a balanced diet rich in fruits, vegetables, and whole grains\n• Limit saturated fats and sodium\n• Don't smoke and limit alcohol\n• Manage stress through relaxation techniques\n• Get adequate sleep (7-9 hours)\n• Regular check-ups with your doctor\n\nWould you like specific information about any of these recommendations?"
      } else if (userMessage.toLowerCase().includes("stress") || userMessage.toLowerCase().includes("anxiety")) {
        botResponse =
          "Mental wellness is crucial for overall health. Here are some strategies for managing stress and anxiety:\n\n• Practice deep breathing exercises\n• Try mindfulness or meditation\n• Regular physical activity\n• Maintain a consistent sleep schedule\n• Connect with friends and family\n• Consider professional counseling if needed\n• Limit caffeine and alcohol\n\nIf you're experiencing persistent anxiety or depression, please reach out to a mental health professional."
      } else if (userMessage.toLowerCase().includes("medication")) {
        botResponse =
          "Medication management is important for treatment success. Here are some tips:\n\n• Use pill organizers or medication apps\n• Set daily alarms as reminders\n• Keep medications in a visible location\n• Maintain an updated medication list\n• Never skip doses without consulting your doctor\n• Store medications properly\n\nWould you like recommendations for specific medication reminder apps?"
      } else {
        botResponse =
          "Thank you for your question. I'm here to provide general health information and guidance. For specific medical concerns, I always recommend consulting with a qualified healthcare provider who can give you personalized advice based on your individual health situation.\n\nIs there a particular health topic you'd like to learn more about?"
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    simulateBotResponse(inputValue)
    setInputValue("")
  }

  const handleSuggestionClick = (query: string) => {
    setInputValue(query)
    handleSendMessage()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl transition-all duration-300 ${isMinimized ? "h-16" : "h-[600px]"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-doctor.png" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">AI Health Assistant</CardTitle>
              <p className="text-xs opacity-90">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {message.sender === "user" ? (
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground mb-3">Quick suggestions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      className="justify-start h-auto p-2 text-xs"
                    >
                      <suggestion.icon className="h-3 w-3 mr-2" />
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your health..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ This AI provides general information only. Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
