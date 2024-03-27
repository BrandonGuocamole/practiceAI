import React, {useState} from "react";
import Link from "next/link";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";
import DashboardItems from "components/DashboardItems";
import DashboardClasses  from "components/DashboardClasses";
import DocumentList from "./DocumentList";
import { useAuth } from "util/auth";
export default function DashboardSection (props) {
  const auth = useAuth();
  const [selectedClassId, setSelectedClassId] = useState(null);

  return (
    <Section
      size={props.size}
      bgColor={props.bgColor}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
      textColor={props.textColor}
    >
      <div className="container">
        <SectionHeader
          title={props.title}
          subtitle={props.subtitle}
          strapline={props.strapline}
          className="text-center"
        />
        <div className="flex flex-wrap">
          <div className="p-4 w-full md:w-1/2">
            <div className="rounded border border-gray-200">
              <DashboardItems />
            </div>
          </div>
          <div className="p-4 w-full md:w-1/2">
            <div className="rounded border border-gray-200">
              <DashboardClasses setSelectedClassId={setSelectedClassId}/>
            </div>
          </div>
          {selectedClassId && (
            <div className="p-4 w-full">
              <div className="rounded border border-gray-200">
                <DocumentList classId={selectedClassId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}