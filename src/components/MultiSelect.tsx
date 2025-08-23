import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useRef, useEffect } from "react"
import { IoCheckmark, IoChevronDown, IoClose, IoSearch } from "react-icons/io5"

interface Option {
  value: string
  label: string
  color?: string
}

interface MultiSelectProps {
  label: string;
  options: Option[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  maxDisplayed?: number
  className?: string
  disabled?: boolean
  variant?: "default" | "compact" | "pills"
  error?: string;
}

export function MultiSelect({
  label,
  options,
  selected,
  onSelectionChange,
  placeholder = "Selecionar itens...",
  searchPlaceholder = "Pesquisar...",
  maxDisplayed = 3,
  className,
  disabled = false,
  variant = "default",
  error,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOptions = options.filter((option) => selected.includes(option.value))
  const availableOptions = options.filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()))

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    onSelectionChange(newSelected)
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectionChange(selected.filter((item) => item !== value))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const displayedSelected = selectedOptions.slice(0, maxDisplayed)
  const remainingCount = selectedOptions.length - maxDisplayed

  const renderSelectedItems = () => {
    if (variant === "compact") {
      return (
        <div className={`multi-select__selected-items multi-select__selected-items--compact`}>
          {selected.length > 0 ? (
            <div className="multi-select__badge multi-select__badge--selection-count">
              {selected.length} selecionado{selected.length > 1 ? "s" : ""}
            </div>
          ) : (
            <span className="multi-select__placeholder">{placeholder}</span>
          )}
        </div>
      )
    }

    if (variant === "pills") {
      return (
        <div className={`multi-select__selected-items multi-select__selected-items--pills`}>
          {displayedSelected.map((option) => (
            <div
              key={option.value}
              className="multi-select__selected-item multi-select__selected-item--pill"
            >
              {option.label}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleRemove(option.value, e)}
                className="multi-select__selected-item__remove"
                disabled={disabled}
              >
                <IoClose />
              </Button>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="multi-select__badge multi-select__badge--remaining">
              +{remainingCount} mais
            </div>
          )} 
          {selected.length === 0 && <span className="multi-select__placeholder">{placeholder}</span>}
        </div>
      )
    }

    return (
      <div className="multi-select__selected-items">
        {displayedSelected.map((option) => (
          <div
            key={option.value}
            className="multi-select__selected-item"
          >
            <span className="multi-select__selected-item__text">{option.label}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleRemove(option.value, e)}
              className="multi-select__selected-item__remove"
              disabled={disabled}
            >
              <IoClose />
            </Button>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="multi-select__badge multi-select__badge--remaining">+{remainingCount} mais</div>
        )}
        {selected.length === 0 && <span className="multi-select__placeholder">{placeholder}</span>}
      </div>
    )
  }

  return (
    <div className="form-group">
      <Label>{label}</Label>
      <div className={`multi-select ${className || ''} ${error ? 'multi-select--error' : ''}`} ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={`multi-select__trigger ${disabled ? 'multi-select__trigger--disabled' : ''}`}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <div className="multi-select__trigger__content">{renderSelectedItems()}</div>
          <div className="multi-select__trigger__actions">
            {selected.length > 0 && !disabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearAll()
                }}
                className="multi-select__trigger__clear"
              >
                <IoClose />
              </Button>
            )}
            <div className="multi-select__trigger__chevron">
              <IoChevronDown />
            </div>
          </div>
        </Button>

        {open && (
          <div className="multi-select__popover">
            <div className="multi-select__search">
              <IoSearch />
              <Input
                id="multi-select-search-input"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            
            <div className="multi-select__list">
              {availableOptions.length === 0 ? (
                <div className="multi-select__empty">Nenhum item encontrado.</div>
              ) : (
                <>
                  {availableOptions.map((option) => {
                    const isSelected = selected.includes(option.value)
                    return (
                      <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className="multi-select__option"
                      >
                        <div
                          className={`multi-select__option__checkbox ${
                            isSelected ? 'multi-select__option__checkbox--selected' : ''
                          }`}
                        >
                          {isSelected && <IoCheckmark />}
                        </div>
                        <span className="multi-select__option__label">{option.label}</span>
                        {option.color && (
                          <div 
                            className="multi-select__option__color" 
                            style={{ backgroundColor: option.color }} 
                          />
                        )}
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {selected.length > 0 && (
              <div className="multi-select__footer">
                {selected.length} de {options.length} itens selecionados
              </div>
            )}
          </div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}
