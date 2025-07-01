import React from 'react'
import ReactSelect from 'react-select'

interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: SelectOption | null
  onChange?: (option: SelectOption | null) => void
  isMulti?: boolean
  placeholder?: string
  className?: string
}

const Select: React.FC<SelectProps> = ({ options, value, onChange, isMulti = false, placeholder, className }) => {
  return (
    <ReactSelect
      options={options}
      value={value}
      isMulti={isMulti}
      onChange={onChange as any}
      placeholder={placeholder}
      className={className}
      classNamePrefix="select"
      theme={theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#4ADE80',
          primary25: 'rgba(74, 222, 128, 0.3)',
          neutral0: 'rgba(55, 65, 81, 1)',
          neutral80: '#F9FAFB',
        },
      })}
    />
  )
}

export default Select 