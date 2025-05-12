'use client';
import { useState, useRef, useEffect } from "react"
import { ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export default function FormImageUpload({ 
  title, 
  description, 
  field, 
  required = false,
  accept = "image/*",
  currentImage = null,
  isSquare = false
}) {
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  // Set initial preview if an image already exists
  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage)
    }
  }, [currentImage])

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Update form field value
    field.onChange(file)
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    // Clean up old preview URL when component unmounts
    return () => URL.revokeObjectURL(previewUrl)
  }

  // Trigger file input click when clicking the upload area
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      // Set file to input element to trigger onChange handler
      if (fileInputRef.current) {
        // Create a DataTransfer object to set files property
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInputRef.current.files = dataTransfer.files
        
        // Manually trigger the onChange handler
        handleFileChange({ target: { files: dataTransfer.files } })
      }
    }
  }

  return (
    <FormItem className="space-y-2">
      <FormLabel className="flex items-center gap-2">
        {title}
        {required && <span className="text-cyan-700">*</span>}
      </FormLabel>
      <FormControl>
        <div 
          className={`border-2 border-dashed rounded-xl backdrop-blur-sm transition-all duration-300
          ${preview 
            ? "border-cyan-700/50 bg-black/40" 
            : "border-gray-800/40 hover:border-gray-700/60 bg-black/30"}`}
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="p-8 flex flex-col items-center justify-center cursor-pointer">
            {preview ? (
              <div className="w-full flex flex-col items-center">
                <div className={`overflow-hidden rounded-lg mb-4 transition-transform duration-500 hover:scale-105 ${isSquare ? 'aspect-square w-40 h-40' : 'w-full max-h-48'}`}>
                  <img 
                    src={typeof preview === 'string' && preview.startsWith('/') ? preview : preview}
                    alt="Preview" 
                    className={`shadow-md ${isSquare ? 'w-full h-full object-cover' : 'w-full h-auto object-cover'}`}
                  />
                </div>
                <p className="text-sm text-cyan-400/80 mb-3">
                  {typeof field.value === 'object' ? 'New image selected' : 'Current image'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  className="rounded-full px-4 bg-black/40 hover:bg-black/60 border-gray-700/40 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreview(null)
                    field.onChange(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                >
                  Change image
                </Button>
              </div>
            ) : (
              <>
                <div className={`mb-4 flex items-center justify-center ${isSquare ? 'w-32 h-32 border-2 border-dashed border-gray-700 rounded-lg' : ''}`}>
                  <ImageIcon className="h-12 w-12 text-gray-600 opacity-50" />
                </div>
                <p className="text-sm text-gray-400 mb-2 text-center">Drag and drop an image here, or click to select</p>
                <p className="text-xs text-gray-500 mb-4 text-center">
                  {isSquare 
                    ? "Recommended: square image, min 500×500 pixels" 
                    : "Recommended size: 1200 x 630 pixels"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  className="rounded-full px-4 bg-black/40 hover:bg-black/60 border-gray-700/40 hover:border-cyan-900/30 transition-all duration-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept={accept}
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        </div>
      </FormControl>
      {description && <FormDescription className="text-gray-500">{description}</FormDescription>}
      <FormMessage className="text-cyan-700" />
    </FormItem>
  )
}