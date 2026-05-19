import Image from "next/image";
import React from "react";
import { testimonials } from "@/app/constants";
import { Title } from "@components/HomePage";
import { Star } from "lucide-react";

export default function TestimonialSection() {
  return (
    <section className="w-full bg-gray-50 text-black px-4 sm:px-10 lg:px-20 mx-auto py-20">
      <Title>What Our Clients Say</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h3 className="font-medium">{testimonial.name}</h3>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{`"${testimonial.comment}"`}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
