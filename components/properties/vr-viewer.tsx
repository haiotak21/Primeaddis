"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Glasses } from "lucide-react"

interface VRViewerProps {
  vrTourUrl: string
  propertyTitle: string
}

export function VRViewer({ vrTourUrl, propertyTitle }: VRViewerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <Glasses className="mr-2 h-4 w-4" />
          View in VR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>VR Tour - {propertyTitle}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            src={vrTourUrl}
            className="h-full w-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
