"use client";

import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { faqData } from "@/app/constants";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { createNewSupportTicket } from "./action";
import { Label } from "@/app/components/ui/label";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(512),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(512),
  message: z.string().min(1, "Message is required").max(4096),
});
export type SupportFormData = z.infer<typeof formSchema>;

export default function Help() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<SupportFormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: SupportFormData) => {
    try {
      const { _id } = await createNewSupportTicket(data);
      if (!_id) throw new Error("Something went wrong");
      toast.success("Message sent successfully!");
      reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-main">
      <Navbar withEffect={false} />

      {/* Header */}
      <div className="bg-[#1C1C25] text-white py-12 pt-32">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-400">
            Find answers to common questions or get in touch with our support
            team.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-8">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-4 text-left py-3 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-left px-4 pb-3 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold py-4 px-1">Contact Us</h1>
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  className={`block text-sm font-medium mb-2 ${
                    errors.fullName ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Full Name
                </Label>
                <Input
                  {...register("fullName")}
                  placeholder="Enter your name"
                  className={`bg-white ${
                    errors.fullName ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
              <div>
                <Label
                  className={`block text-sm font-medium mb-2 ${
                    errors.email ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Email Address
                </Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                  className={`bg-white ${
                    errors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
            </div>
            <div>
              <Label
                className={`block text-sm font-medium mb-2 ${
                  errors.subject ? "text-red-500" : "text-gray-700"
                }`}
              >
                Subject
              </Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="technical" className="text-main">
                        Technical Issue
                      </SelectItem>
                      <SelectItem value="billing" className="text-main">
                        Billing Question
                      </SelectItem>
                      <SelectItem value="feature" className="text-main">
                        Feature Request
                      </SelectItem>
                      <SelectItem value="other" className="text-main">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label
                className={`block text-sm font-medium mb-2 ${
                  errors.message ? "bg-red-500" : "text-gray-700"
                }`}
              >
                Message
              </Label>
              <Textarea
                {...register("message")}
                placeholder="Describe your issue or question"
                className={`h-32 bg-white ${
                  errors.message ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-main text-white hover:bg-main"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
