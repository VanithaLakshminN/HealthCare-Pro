"use client"
import medicineImage from "@/public/image.png"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, Truck, Shield, Star, Plus, Minus } from "lucide-react"

export function PharmacySection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<{ [key: string]: number }>({})

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "prescription", label: "Prescription Drugs" },
    { value: "otc", label: "Over-the-Counter" },
    { value: "vitamins", label: "Vitamins & Supplements" },
    { value: "personal-care", label: "Personal Care" },
    { value: "medical-devices", label: "Medical Devices" },
  ]

  const medicines = [
  {
    "id": "1",
    "name": "Paracetamol 500mg",
    "category": "otc",
    "price": 12.99,
    "originalPrice": 15.99,
    "description": "Pain relief and fever reducer",
    "image": "/paracetamol.png",
    "rating": 4.5,
    "reviews": 234,
    "inStock": true,
    "prescription": false,
    "manufacturer": "HealthCorp"
  },
  {
    "id": "2",
    "name": "Amoxicillin 250mg",
    "category": "antibiotic",
    "price": 24.5,
    "originalPrice": 28.0,
    "description": "Broad-spectrum antibiotic for bacterial infections",
    "image": "/amoxicillin.png",
    "rating": 4.7,
    "reviews": 180,
    "inStock": true,
    "prescription": true,
    "manufacturer": "MediPharma"
  },
  {
    "id": "3",
    "name": "Ibuprofen 400mg",
    "category": "otc",
    "price": 18.99,
    "originalPrice": 21.99,
    "description": "Pain reliever and anti-inflammatory",
    "image": "/ibuprofen.png",
    "rating": 4.6,
    "reviews": 312,
    "inStock": true,
    "prescription": false,
    "manufacturer": "WellnessLabs"
  },
  {
    "id": "4",
    "name": "Cetirizine 10mg",
    "category": "antihistamine",
    "price": 9.5,
    "originalPrice": 12.0,
    "description": "Allergy relief for sneezing, itching, and watery eyes",
    "image": "/cetirizine.png",
    "rating": 4.3,
    "reviews": 145,
    "inStock": true,
    "prescription": false,
    "manufacturer": "AllerGenix"
  },
  {
    "id": "5",
    "name": "Metformin 500mg",
    "category": "diabetes",
    "price": 30.0,
    "originalPrice": 35.0,
    "description": "Helps control blood sugar levels",
    "image": "/metformin.png",
    "rating": 4.4,
    "reviews": 210,
    "inStock": true,
    "prescription": true,
    "manufacturer": "Glucare"
  },
  {
    "id": "6",
    "name": "Azithromycin 500mg",
    "category": "antibiotic",
    "price": 40.99,
    "originalPrice": 45.0,
    "description": "Macrolide antibiotic for respiratory infections",
    "image": "/azithromycin.png",
    "rating": 4.6,
    "reviews": 198,
    "inStock": true,
    "prescription": true,
    "manufacturer": "BioPharma"
  },
  {
    "id": "7",
    "name": "Atorvastatin 20mg",
    "category": "cholesterol",
    "price": 25.0,
    "originalPrice": 29.0,
    "description": "Lowers cholesterol and triglycerides",
    "image": "/atorvastatin.png",
    "rating": 4.5,
    "reviews": 154,
    "inStock": true,
    "prescription": true,
    "manufacturer": "CardioCare"
  },
  {
    "id": "8",
    "name": "Vitamin C 1000mg",
    "category": "supplement",
    "price": 15.0,
    "originalPrice": 18.0,
    "description": "Boosts immunity and antioxidant support",
    "image": "/vitaminc.png",
    "rating": 4.7,
    "reviews": 400,
    "inStock": true,
    "prescription": false,
    "manufacturer": "NutriLife"
  },
  {
    "id": "9",
    "name": "Omeprazole 20mg",
    "category": "digestive",
    "price": 22.99,
    "originalPrice": 26.0,
    "description": "Reduces stomach acid and treats heartburn",
    "image": "/omeprazole.png",
    "rating": 4.4,
    "reviews": 167,
    "inStock": true,
    "prescription": true,
    "manufacturer": "GastroPharm"
  },
  {
    "id": "10",
    "name": "Loratadine 10mg",
    "category": "antihistamine",
    "price": 11.0,
    "originalPrice": 13.5,
    "description": "Non-drowsy allergy relief",
    "image": "/loratadine.png",
    "rating": 4.3,
    "reviews": 190,
    "inStock": true,
    "prescription": false,
    "manufacturer": "AllergyFree"
  },
  {
    "id": "11",
    "name": "Losartan 50mg",
    "category": "hypertension",
    "price": 28.0,
    "originalPrice": 32.0,
    "description": "Controls high blood pressure",
    "image": "/losartan.png",
    "rating": 4.5,
    "reviews": 134,
    "inStock": true,
    "prescription": true,
    "manufacturer": "CardioHealth"
  },
  {
    "id": "12",
    "name": "Aspirin 75mg",
    "category": "cardio",
    "price": 10.5,
    "originalPrice": 13.0,
    "description": "Blood thinner for heart protection",
    "image": "/aspirin.png",
    "rating": 4.6,
    "reviews": 245,
    "inStock": true,
    "prescription": false,
    "manufacturer": "HeartWell"
  },
  {
    "id": "13",
    "name": "Clarithromycin 500mg",
    "category": "antibiotic",
    "price": 36.0,
    "originalPrice": 41.0,
    "description": "Antibiotic for bacterial infections",
    "image": "/clarithromycin.png",
    "rating": 4.2,
    "reviews": 120,
    "inStock": true,
    "prescription": true,
    "manufacturer": "MediGen"
  },
  {
    "id": "14",
    "name": "Multivitamin Tablets",
    "category": "supplement",
    "price": 20.0,
    "originalPrice": 24.0,
    "description": "Daily essential vitamins and minerals",
    "image": "/multivitamin.png",
    "rating": 4.8,
    "reviews": 512,
    "inStock": true,
    "prescription": false,
    "manufacturer": "NutriPlus"
  },
  {
    "id": "15",
    "name": "Levothyroxine 50mcg",
    "category": "thyroid",
    "price": 18.5,
    "originalPrice": 22.0,
    "description": "Thyroid hormone replacement",
    "image": "/levothyroxine.png",
    "rating": 4.5,
    "reviews": 175,
    "inStock": true,
    "prescription": true,
    "manufacturer": "EndoPharma"
  },
  {
    "id": "16",
    "name": "Calcium + Vitamin D3",
    "category": "supplement",
    "price": 16.0,
    "originalPrice": 19.0,
    "description": "Bone health support",
    "image": "/calciumd3.png",
    "rating": 4.7,
    "reviews": 320,
    "inStock": true,
    "prescription": false,
    "manufacturer": "BoneCare"
  },
  {
    "id": "17",
    "name": "Prednisone 10mg",
    "category": "steroid",
    "price": 27.5,
    "originalPrice": 32.0,
    "description": "Corticosteroid for inflammation",
    "image": "/prednisone.png",
    "rating": 4.2,
    "reviews": 98,
    "inStock": true,
    "prescription": true,
    "manufacturer": "SteroidPharma"
  },
  {
    "id": "18",
    "name": "Hydroxyzine 25mg",
    "category": "antihistamine",
    "price": 19.0,
    "originalPrice": 23.0,
    "description": "Relieves anxiety, itching, and allergies",
    "image": "/hydroxyzine.png",
    "rating": 4.3,
    "reviews": 88,
    "inStock": true,
    "prescription": true,
    "manufacturer": "RelaxPharma"
  },
  {
    "id": "19",
    "name": "Fish Oil 1000mg",
    "category": "supplement",
    "price": 22.0,
    "originalPrice": 26.0,
    "description": "Omega-3 fatty acids for heart and brain health",
    "image": "/fishoil.png",
    "rating": 4.6,
    "reviews": 278,
    "inStock": true,
    "prescription": false,
    "manufacturer": "NutriSea"
  },
  {
    "id": "20",
    "name": "Sertraline 50mg",
    "category": "antidepressant",
    "price": 35.0,
    "originalPrice": 40.0,
    "description": "Treats depression and anxiety disorders",
    "image": "/sertraline.png",
    "rating": 4.4,
    "reviews": 156,
    "inStock": true,
    "prescription": true,
    "manufacturer": "MindWell"
  }
]


  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || medicine.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (medicineId: string) => {
    setCart((prev) => ({
      ...prev,
      [medicineId]: (prev[medicineId] || 0) + 1,
    }))
  }

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newCart[medicineId] > 1) {
        newCart[medicineId] -= 1
      } else {
        delete newCart[medicineId]
      }
      return newCart
    })
  }

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0)
  }

  return (
    <section id="pharmacy" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Online Pharmacy</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Order medicines and healthcare products online with guaranteed authenticity and fast delivery to your
            doorstep.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search medicines, vitamins, or healthcare products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="md:w-auto">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart ({getTotalItems()})
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-center space-x-3 p-4 bg-card rounded-lg">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold text-card-foreground">Free Delivery</h3>
              <p className="text-sm text-muted-foreground">On orders above $50</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-card rounded-lg">
            <Shield className="h-8 w-8 text-accent" />
            <div>
              <h3 className="font-semibold text-card-foreground">Genuine Products</h3>
              <p className="text-sm text-muted-foreground">100% authentic medicines</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-card rounded-lg">
            <Star className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold text-card-foreground">Expert Support</h3>
              <p className="text-sm text-muted-foreground">Pharmacist consultation</p>
            </div>
          </div>
        </div>

        {/* Medicine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine) => (
            <Card key={medicine.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="relative">
                  <img
                    src="./image.png"
                    alt={medicine.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  {medicine.prescription && (
                    <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                      Prescription Required
                    </Badge>
                  )}
                  
                </div>
                <CardTitle className="text-lg text-card-foreground">{medicine.name}</CardTitle>
                <CardDescription className="text-sm">{medicine.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-muted-foreground">{medicine.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({medicine.reviews} reviews)</span>
                </div>

                

                <p className="text-xs text-muted-foreground mb-4">By {medicine.manufacturer}</p>

                <div className="flex items-center justify-between">

                  <Badge variant={medicine.inStock ? "secondary" : "destructive"} className="bg-green-700">
                    {medicine.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No medicines found matching your search criteria.</p>
          </div>
        )}
      </div>
    </section>
  )
}
