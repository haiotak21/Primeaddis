"use client";
import { RequestSiteVisit } from "./request-site-visit";

export default function RequestSiteVisitClient(props: {
  propertyId: string;
  propertyTitle: string;
}) {
  return <RequestSiteVisit {...props} />;
}
