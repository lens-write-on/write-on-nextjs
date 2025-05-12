'use client';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Enhanced form field input component with support for icons, descriptions, and different input types
 * 
 * @param {object} props - Component props
 * @param {object} props.formControl - React Hook Form control object
 * @param {string} props.fieldName - Name of the field in the form schema
 * @param {string} props.title - Label text for the form field
 * @param {string} props.placeholder - Placeholder text for the input field
 * @param {React.ReactNode} props.icon - Optional icon to display next to the label
 * @param {string} props.description - Optional description text to display below the input
 * @param {string} props.type - Input type (text, email, password, number, date, datetime-local, textarea)
 * @param {boolean} props.required - Whether the field is required
 * @param {object} props.validation - Additional validation options
 * @param {number} props.rows - Number of rows for textarea (only applies when type is textarea)
 */
const FormFieldInput = ({
  formControl,
  fieldName,
  title,
  placeholder,
  icon = null,
  description = "",
  type = "text",
  required = false,
  validation = {},
  rows = 3,
  parentClassName = "",
  className = "",
}) => {
  return (
    <FormField
      control={formControl}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={cn(parentClassName)}>
          <FormLabel className="flex items-center gap-2">
            {icon && <span className="text-cyan-400/80">{icon}</span>}
            {title} {required && <span className="text-cyan-700">*</span>}
          </FormLabel>
          <FormControl>
            {type === "textarea" ? (
              <Textarea
                placeholder={placeholder || `Enter ${title.toLowerCase()}`}
                className={cn("bg-black/50 backdrop-blur-sm border-gray-800/40 rounded-xl hover:border-gray-700/60 focus:border-cyan-900/30 transition-all duration-300 placeholder:text-gray-500", className)}
                rows={rows}
                {...field}
              />
            ) : (
              <Input
                type={type === "date" ? "datetime-local" : type}
                placeholder={placeholder || `Enter ${title.toLowerCase()}`}
                className={cn(className)}
                // className={cn("bg-black/50 backdrop-blur-sm border-gray-800/40 rounded-xl hover:border-gray-700/60 focus:border-cyan-900/30 transition-all duration-300 placeholder:text-gray-500", className)}
                {...field}
                value={
                  type === "date" && field.value instanceof Date 
                    ? field.value.toISOString().slice(0, 16) // Format as YYYY-MM-DDTHH:MM
                    : field.value
                }
                onChange={(e) => {
                  if (type === "date") {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    field.onChange(date);
                  } else if (type === "number") {
                    const value = e.target.value === "" ? "" : Number(e.target.value);
                    field.onChange(value);
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
              />
            )}
          </FormControl>
          {description && <FormDescription className={cn("text-gray-500")}>{description}</FormDescription>}
          <FormMessage className="text-cyan-700" />
        </FormItem>
      )}
    />
  );
};

export default FormFieldInput;