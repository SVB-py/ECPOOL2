import { useState } from "react";
import { Plus, Edit, Trash2, FileText, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const MyVehicles = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const vehicles = [
    {
      id: 1,
      make: "Toyota",
      model: "Camry",
      year: 2020,
      plate: "ABC-1234",
      color: "Silver",
      capacity: 7,
      type: "Sedan",
      verified: true,
      active: true,
      documents: {
        registration: true,
        insurance: true,
        photos: true,
      },
    },
    {
      id: 2,
      make: "Honda",
      model: "Accord",
      year: 2019,
      plate: "XYZ-5678",
      color: "White",
      capacity: 5,
      type: "Sedan",
      verified: false,
      active: false,
      documents: {
        registration: true,
        insurance: true,
        photos: false,
      },
    },
  ];

  const handleAddVehicle = () => {
    setDialogOpen(true);
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    toast({
      title: "Vehicle Submitted! ⏳",
      description: "We'll verify within 24 hours",
    });
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Vehicles</h1>
            <p className="text-muted-foreground">Manage your registered vehicles</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="hero"
                size="lg"
                className="rounded-full"
                onClick={handleAddVehicle}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Step {currentStep} of 3
                </DialogDescription>
              </DialogHeader>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full ${
                      step <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Step 1 - Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vehicle Type</label>
                      <select className="w-full px-3 py-2 rounded-md bg-background border border-input">
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Van</option>
                        <option>Bus</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Make</label>
                      <select className="w-full px-3 py-2 rounded-md bg-background border border-input">
                        <option>Toyota</option>
                        <option>Honda</option>
                        <option>Nissan</option>
                        <option>Ford</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model</label>
                    <Input placeholder="Camry" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year</label>
                      <select className="w-full px-3 py-2 rounded-md bg-background border border-input">
                        {Array.from({ length: 11 }, (_, i) => 2025 - i).map((year) => (
                          <option key={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color</label>
                      <Input placeholder="Silver" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">License Plate</label>
                    <Input placeholder="ABC-1234" />
                  </div>
                  <Button className="w-full" onClick={() => setCurrentStep(2)}>
                    Next
                  </Button>
                </div>
              )}

              {/* Step 2 - Capacity & Features */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Passenger Capacity</label>
                    <Input type="number" min="1" max="15" defaultValue="4" />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Air Conditioning</span>
                      <Switch defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Women-only Rides</span>
                      <Switch />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Wheelchair Accessible</span>
                      <Switch />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Child Seats Available</span>
                      <Switch />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button className="flex-1" onClick={() => setCurrentStep(3)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3 - Documents */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Registration</label>
                    <Input type="file" accept=".pdf,.jpg,.png" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Insurance Certificate</label>
                    <Input type="file" accept=".pdf,.jpg,.png" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Photos</label>
                    <Input type="file" accept="image/*" multiple />
                    <p className="text-xs text-muted-foreground">
                      Upload 4 photos: front, back, side, interior
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button variant="hero" className="flex-1" onClick={handleSubmit}>
                      Submit for Verification
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="container mx-auto px-4 -mt-8">
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`glass-card p-6 hover-scale ${
                  vehicle.active ? "ring-2 ring-primary shadow-glow" : ""
                }`}
              >
                {/* Vehicle Image Placeholder */}
                <div className="bg-muted/50 h-48 rounded-lg flex items-center justify-center mb-4">
                  <Car className="w-24 h-24 text-muted-foreground" />
                </div>

                {/* Active Badge */}
                {vehicle.active && (
                  <Badge className="mb-4 animate-glow-pulse">ACTIVE</Badge>
                )}

                {/* Vehicle Details */}
                <h3 className="text-2xl font-bold mb-2">
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </h3>

                {/* License Plate */}
                <div className="bg-gradient-primary text-foreground px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-4 font-mono font-bold">
                  🇴🇲 {vehicle.plate}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ backgroundColor: vehicle.color.toLowerCase() }}
                    />
                    <span className="text-sm">{vehicle.color}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{vehicle.capacity} passengers</span>
                    <span className="text-muted-foreground">
                      {Array.from({ length: vehicle.capacity }).map((_, i) => (
                        <span key={i}>💺</span>
                      ))}
                    </span>
                  </div>
                  <Badge variant="secondary">{vehicle.type}</Badge>
                </div>

                {/* Verification Status */}
                <div className="mb-4">
                  {vehicle.verified ? (
                    <Badge className="bg-primary/20 text-primary text-lg px-4 py-2">
                      ✅ Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-accent/20 text-accent text-lg px-4 py-2">
                      ⏳ Pending Verification
                    </Badge>
                  )}
                </div>

                {/* Documents */}
                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{vehicle.documents.registration ? "✅" : "⏳"}</span>
                    <span>Registration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{vehicle.documents.insurance ? "✅" : "⏳"}</span>
                    <span>Insurance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{vehicle.documents.photos ? "✅" : "⏳"}</span>
                    <span>Photos</span>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg mb-4">
                  <span className="font-medium">Set as Active Vehicle</span>
                  <Switch checked={vehicle.active} />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2">No vehicles registered yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first vehicle to start offering rides
            </p>
            <Button variant="hero" size="lg" onClick={handleAddVehicle}>
              <Plus className="w-5 h-5 mr-2" />
              Add Vehicle
            </Button>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyVehicles;
