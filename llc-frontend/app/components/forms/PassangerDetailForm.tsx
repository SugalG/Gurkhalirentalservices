import { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronDown, Lock, Mail, Pen, User } from "lucide-react";
import { PassengerDetails } from "@/app/types";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { Textarea } from "@components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface PassengerDetailsFormProps {
  onSubmit: (data: PassengerDetails) => void;
  initialData?: PassengerDetails | null;
  formType?: string;
}

export function PassengerDetailsForm({
  onSubmit,
  initialData,
  formType,
}: PassengerDetailsFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignName, setShowSignName] = useState<boolean>(false);

  // Refs to manage input focus
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const specialInstructionsRef = useRef<HTMLTextAreaElement | null>(null);
  const signNameRef = useRef<HTMLInputElement | null>(null);

  // State for form inputs
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [specialInstructions, setSpecialInstructions] = useState(
    initialData?.specialInstructions || ""
  );
  const [signName, setSignName] = useState(initialData?.meetAndGreetName || "");

  const isFormValid = () => {
    return firstName && lastName && email && phone;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      firstName,
      lastName,
      email,
      phone,
      specialInstructions,
      meetAndGreetName: signName,
    });
  };

  // preventing cursor jumping
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    const cursorPosition = target.selectionStart;

    setSpecialInstructions(target.value);

    setTimeout(() => {
      if (specialInstructionsRef.current) {
        specialInstructionsRef.current.setSelectionRange(
          cursorPosition,
          cursorPosition
        );
      }
    }, 0);
  };

  useEffect(() => {
    if (firstName && firstNameRef.current) {
      firstNameRef.current.focus();
    }
  }, [firstName]);

  useEffect(() => {
    if (lastName && lastNameRef.current) {
      lastNameRef.current.focus();
    }
  }, [lastName]);

  useEffect(() => {
    if (email && emailRef.current) {
      emailRef.current.focus();
    }
  }, [email]);

  useEffect(() => {
    if (phone && phoneRef.current) {
      phoneRef.current.focus();
    }
  }, [phone]);

  useEffect(() => {
    if (specialInstructions && specialInstructionsRef.current) {
      specialInstructionsRef.current.focus();
    }
  }, [specialInstructions]);

  useEffect(() => {
    if (signName && signNameRef.current) {
      signNameRef.current.focus();
    }
  }, [signName]);

  const FormContent = () => {
    return (
      <form
        onSubmit={handleSubmit}
        className={`max-w-3xl py-8 bg-white p-5 rounded-2xl mx-auto ${
          formType !== "edit" && "shadow-md"
        } text-main space-y-5`}
      >
        {!formType && (
          <div className="space-y-1">
            <h2 className="text-2xl font-bold ">Passenger Details</h2>
            <p className="text-sm">
              Please fill out the required details for your trip.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                ref={firstNameRef}
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10 bg-white "
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                ref={lastNameRef}
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10 bg-white"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              ref={emailRef}
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white"
              required
            />
          </div>
          <p className="text-sm text-gray-500">
            Your booking confirmation will be sent to this email.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="flex">
            <Select defaultValue="+1">
              <SelectTrigger className="w-[120px] rounded-r-none bg-white">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-white text-main">
                <SelectItem value="+1">+1 (US)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              ref={phoneRef}
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-l-none bg-white"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialInstructions">Special Instructions</Label>
          <div className="relative">
            <Pen className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Textarea
              ref={specialInstructionsRef}
              id="specialInstructions"
              name="specialInstructions"
              placeholder="Add any special instructions for the driver"
              value={specialInstructions}
              onChange={handleTextAreaChange}
              className="pl-10 min-h-[100px] bg-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Checkbox
              id="meetAndGreet"
              name="meetAndGreet"
              className="border-main"
              onCheckedChange={() => setShowSignName(!showSignName)}
              checked={showSignName}
            />
            <div className="space-y-1">
              <Label htmlFor="meetAndGreet" className="text-base font-medium">
                Meet & Greet Service
              </Label>
              <p className="text-sm text-gray-500">
                Driver will wait with your name on a sign
              </p>
            </div>
          </div>

          {showSignName && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                ref={signNameRef}
                name="signName"
                placeholder="Enter the name you want displayed on the sign"
                value={signName}
                onChange={(e) => setSignName(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors ${
            isFormValid()
              ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          disabled={!isFormValid()}
        >
          <span>
            {formType === "edit" ? "Update Details" : "Proceed to Booking"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    );
  };

  if (formType === "edit") {
    return (
      <div className="w-full mx-auto p-4">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="border bg-white rounded-lg hover:bg-none overflow-hidden"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Passenger Details</h2>
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 bg-white pt-0">
            <FormContent />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className="md:w-2/3 w-full">
      <FormContent />
    </div>
  );
}
