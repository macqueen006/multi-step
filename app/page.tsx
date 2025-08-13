"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { Input } from "./components/input";

// Step schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const addressSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
});

// Combined schema for all steps
const formSchema = z.object({
  ...personalInfoSchema.shape,
  ...addressSchema.shape,
  ...paymentSchema.shape,
});

type FormData = z.infer<typeof formSchema>;
type PersonalInfoData = z.infer<typeof personalInfoSchema>;
type AddressData = z.infer<typeof addressSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

const steps = [
  {
    id: "personal",
    title: "Personal Info",
    icon: User,
    schema: personalInfoSchema,
  },
  {
    id: "address",
    title: "Address",
    icon: Mail,
    schema: addressSchema,
  },
  {
    id: "payment",
    title: "Payment",
    icon: CreditCard,
    schema: paymentSchema,
  },
];

const Home = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  // Create separate form instances for each step
  const personalForm = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const addressForm = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    mode: "onChange",
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
  });

  const getCurrentForm = () => {
    switch (currentStep) {
      case 0:
        return personalForm;
      case 1:
        return addressForm;
      case 2:
        return paymentForm;
      default:
        return personalForm;
    }
  };

  const validateCurrentStep = async () => {
    const currentForm = getCurrentForm();
    const isValid = await currentForm.trigger();

    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      // Store current step data
      const stepData = currentForm.getValues();
      setFormData(prev => ({ ...prev, ...stepData }));
    }

    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = async (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1) {
      await nextStep();
    }
  };

  const onSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      console.log("Form submitted:", formData);
      setIsSubmitted(true);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;
        const isClickable = index <= currentStep || completedSteps.has(index);

        return (
          <React.Fragment key={step.id}>
            <div
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                isClickable
                  ? "hover:scale-105"
                  : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => isClickable && goToStep(index)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span
                className={`text-sm mt-2 font-medium ${
                  isCurrent
                    ? "text-blue-600"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mx-4 transition-all duration-200 ${
                  completedSteps.has(index) ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            {...personalForm.register("firstName")}
            label="First name"
            type="text"
            placeholder="Enter your first name"
            error={personalForm.formState.errors.firstName?.message}
          />
        </div>
        <div>
          <Input
            {...personalForm.register("lastName")}
            label="Last name"
            type="text"
            placeholder="Enter your last name"
            error={personalForm.formState.errors.lastName?.message}
          />
        </div>
      </div>
      <div>
        <Input
          {...personalForm.register("email")}
          label="Email"
          type="email"
          placeholder="Enter your email address"
          error={personalForm.formState.errors.email?.message}
        />
      </div>
      <div>
        <Input
          {...personalForm.register("phone")}
          label="Phone number"
          type="tel"
          placeholder="Enter your phone number"
          error={personalForm.formState.errors.phone?.message}
        />
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Address Information
      </h2>
      <div>
        <Input
          {...addressForm.register("street")}
          label="Street Address"
          type="text"
          placeholder="Enter Street Address"
          error={addressForm.formState.errors.street?.message}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            {...addressForm.register("city")}
            label="City"
            type="text"
            placeholder="Enter your city"
            error={addressForm.formState.errors.city?.message}
          />
        </div>
        <div>
          <Input
            {...addressForm.register("state")}
            label="State"
            type="text"
            placeholder="Enter your state"
            error={addressForm.formState.errors.state?.message}
          />
        </div>
      </div>
      <div>
        <Input
          {...addressForm.register("zipCode")}
          label="ZIP Code"
          type="text"
          placeholder="Enter your ZIP code"
          error={addressForm.formState.errors.zipCode?.message}
        />
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Payment Information
      </h2>
      <div>
        <Input
          {...paymentForm.register("cardNumber")}
          label="Card Number"
          type="text"
          placeholder="1234 5678 9012 3456"
          maxLength={16}
          error={paymentForm.formState.errors.cardNumber?.message}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            {...paymentForm.register("expiryDate")}
            label="Expiry Date"
            type="text"
            placeholder="MM/YY"
            maxLength={5}
            error={paymentForm.formState.errors.expiryDate?.message}
          />
        </div>
        <div>
          <Input
            {...paymentForm.register("cvv")}
            label="CVV"
            type="text"
            placeholder="123"
            maxLength={4}
            error={paymentForm.formState.errors.cvv?.message}
          />
        </div>
      </div>
      <div>
        <Input
          {...paymentForm.register("cardholderName")}
          label="Cardholder Name"
          type="text"
          placeholder="Enter cardholder name"
          error={paymentForm.formState.errors.cardholderName?.message}
        />
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Form Submitted Successfully!
      </h2>
      <p className="text-gray-600 mb-6">
        Thank you for completing the form. Your information has been submitted.
      </p>
      <button
        onClick={() => {
          setIsSubmitted(false);
          setCurrentStep(0);
          setCompletedSteps(new Set());
          setFormData({});
          personalForm.reset();
          addressForm.reset();
          paymentForm.reset();
        }}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Start Over
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderAddressStep();
      case 2:
        return renderPaymentStep();
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return <div className="max-w-2xl mx-auto p-6">{renderSuccessStep()}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderStepIndicator()}

        <div className="space-y-6">
          {renderCurrentStep()}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft size={20} className="mr-1" />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Next
                <ChevronRight size={20} className="ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Submit
                <CheckCircle size={20} className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;