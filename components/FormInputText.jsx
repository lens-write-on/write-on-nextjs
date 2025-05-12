'use client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const FormInputText = ({formControl, fieldName, title, placeholder}) => {
    return(
        <FormField
            control={formControl}
            name={fieldName}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">
                    {title}
                    </FormLabel>
                    <FormControl>
                    <Input
                        placeholder={placeholder || `Enter ${title.toLowerCase()}`}
                        className="bg-gray-950 border-gray-800"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default FormInputText;