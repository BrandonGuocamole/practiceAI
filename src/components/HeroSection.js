import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";
import Button from "components/Button";

function HeroSection(props) {
  return (
    <Section
      size={props.size}
      bgColor={props.bgColor}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
      textColor={props.textColor}
    >
      <div className="container flex flex-col lg:flex-row-reverse space-y-3 lg:space-y-0 text-center lg:text-left">
        <div className="lg:w-1/2 lg:self-center">
          <SectionHeader
            title={props.title}
            subtitle={props.subtitle}
            strapline={props.strapline}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-2 pt-10 pb-16">
            <Link href="/pricing" passHref={true}>
              <Button
                size="xl"
                endIcon={
                  <ArrowRightIcon className="opacity-70 inline-block w-5 h-5" />
                }
              >
                Join us today
              </Button>
            </Link>
            <Link href="/about" passHref={true}>
              <Button size="xl" variant="light">
                Learn more
              </Button>
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 lg:mr-16 lg:flex lg:justify-center lg:items-center pb-12 md:pb-0">
          <div className="relative">
            <div className="absolute pattern-dots text-blue-100 top-0 left-0 w-32 h-48 md:h-96 transform -translate-y-12 -translate-x-16 -rotate-3" />
            <div className="absolute pattern-dots text-blue-100 bottom-0 right-0 w-32 h-48 md:h-96 transform translate-y-12 translate-x-16 rotate-3" />
            <div className="absolute rounded-full top-0 right-0 w-32 h-32 bg-yellow-200 bg-opacity-50 -mt-12 -mr-12" />
            <div className="absolute rounded-xl bottom-0 left-0 w-32 h-32 bg-blue-200 bg-opacity-50 -mb-10 -ml-10 transform rotate-3" />
            <img
              className="w-full h-96 lg:w-96 lg:h-auto relative object-cover rounded-lg mx-auto shadow-lg"
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=1000&w=800"
              alt=""
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

export default HeroSection;
