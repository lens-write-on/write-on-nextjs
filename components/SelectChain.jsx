import { useState, useEffect } from "react";

const SelectChain = ({
  defaultValue = "",
  options = [],
  id = "from",
  onValueChange = () => {},
  excludeValue = null, // Add prop for excluded value
  label = "From", // Add customizable label
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  // Update selected value when defaultValue changes (for switch functionality)
  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const selected = options
    ? options.find((option) => option?.id?.toString() === selectedValue?.toString())
    : null;

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    onValueChange(value);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      <div className="relative">
        {/* Visual representation of selected item with icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {selected?.iconUrl && (
            <div className="w-6 h-6 rounded-full bg-java-500/50 flex items-center justify-center">
              <span className="text-white text-xs">
                <img
                  src={selected?.iconUrl}
                  alt={selected?.name}
                  className="w-5 h-5 rounded-full"
                />
              </span>
            </div>
          )}
        </div>

        <select
          id={id}
          value={selectedValue}
          onChange={handleChange}
          className={`flex h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-2 ${
            selected?.iconUrl ? "pl-10 pr-3" : "px-3"
          }`}
        >
          {options.map((chain) => (
            <option
              key={`${id}-${chain.id}`}
              value={chain.id}
              disabled={chain.id === excludeValue} // Disable if matches excluded value
            >
              {chain.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectChain;
