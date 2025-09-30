"use client"

import React from "react"
import ReactSelect from "react-select"
import { useFormField } from "../ui/form"

export // Custom ReactSelect component that uses form field error state
function FormReactSelect({ ...props }: any) {
  const { error } = useFormField()
  const [mountedPortalTarget, setMountedPortalTarget] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => {
    setMountedPortalTarget(document.body)
  }, [])

  const menuPortalTarget = props.menuPortalTarget ?? mountedPortalTarget ?? undefined
  const menuPosition = props.menuPosition ?? "fixed"
  const menuShouldScrollIntoView = props.menuShouldScrollIntoView ?? false
  const menuShouldBlockScroll = props.menuShouldBlockScroll ?? true

  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const prevOverflowRef = React.useRef<string | null>(null)
  const selectRef = React.useRef<any>(null)

  const setDialogBodyOverflow = React.useCallback((overflowY: string | null) => {
    const el = wrapperRef.current?.closest("[data-slot='dialog-body']") as HTMLElement | null
    if (!el) return
    if (overflowY === null) {
      if (prevOverflowRef.current !== null) {
        el.style.overflowY = prevOverflowRef.current
        prevOverflowRef.current = null
      }
      return
    }
    if (prevOverflowRef.current === null) prevOverflowRef.current = el.style.overflowY
    el.style.overflowY = overflowY
  }, [])

  return (
    <div ref={wrapperRef} style={{ width: '100%' }}>
      <ReactSelect
      ref={selectRef}
      {...props}
      
      classNamePrefix="rs"
      closeMenuOnSelect={true}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
      menuShouldScrollIntoView={menuShouldScrollIntoView}
        menuShouldBlockScroll={menuShouldBlockScroll}
        onChange={(value: any, actionMeta: any) => {
          props.onChange?.(value, actionMeta)
          if (selectRef.current && typeof selectRef.current.blur === 'function') {
            requestAnimationFrame(() => {
              try { selectRef.current.blur() } catch {}
            })
          }
        }}
        onMenuOpen={(...args: any[]) => {
          setDialogBodyOverflow("visible")
          props.onMenuOpen?.(...args)
        }}
        onMenuClose={(...args: any[]) => {
          setDialogBodyOverflow(null)
          props.onMenuClose?.(...args)
        }}
      styles={{
        container: (baseStyles) => ({
          ...baseStyles,
          width: '100%'
        }),
        control: (baseStyles) => ({
          ...baseStyles,
          minHeight: "43.5px",
          background: "#28282d",
          border: error ? "1px solid oklab(0.71871 0.140732 0.059904)" : "1px solid #97979f1f",
          "&:hover": {
            borderColor: error ? "oklab(0.71871 0.140732 0.059904)" : "#97979f1f",
          },
          boxShadow: "none",
          boxSizing: "content-box",
          borderRadius: '8px',
          alignItems: 'center'
        }),
        input: (baseStyles) => ({
          ...baseStyles,
          margin: "0",
          alignItems: "center",
          display: "flex",
          color: "oklab(0.899401 -0.00192499 -0.00481987)"
        }),
        valueContainer: (baseStyles, state) => ({
          ...baseStyles,
          minHeight: "43.5px",
          padding: state.selectProps.isMulti && state.hasValue ? "6px 12px" : "0 12px",
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: state.selectProps.isMulti && state.hasValue ? 'flex-start' : 'center',
          gap: state.selectProps.isMulti ? 4 : 0
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: "oklab(0.899401 -0.00192499 -0.00481987)",
          margin: "0",
          alignItems: "center",
          display: "flex",
        }),
        placeholder: (baseStyles) => ({
          ...baseStyles,
          alignItems: "center",
          display: "flex",
        }),
        multiValue: (baseStyles) => ({
          ...baseStyles,
          background: "#28282d", // bg-background-surface-high
          border: "1px solid #97979f1f", // border-border-subtle
          color: "#ffffff", // text-white
          alignItems: "center",
          borderRadius: '4px'
        }),
        multiValueLabel: (baseStyles) => ({
          ...baseStyles,
          color: "#ffffff", // text-white
          padding: "2px 6px",
        }),
        multiValueRemove: (baseStyles) => ({
          ...baseStyles,
          color: "#b5bac1",
          ':hover': {
            backgroundColor: 'transparent',
            color: '#ffffff'
          }
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          background: state.isSelected
            ? "#28282d"
            : state.isFocused
              ? "#242429"
              : "transparent",
          padding: "9.75px",
          display: "flex",
          ":active": {
            background: state.isSelected
              ? "#28282d"
              : state.isFocused
                ? "#242429"
                : "transparent",
          },
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          color: "oklab(0.786807 -0.0025776 -0.0110238)",
          background: "#202024",
          marginTop: '8px',
          border: '1px solid #97979f1f',
          borderRadius: '8px'
        }),
        menuList: (baseStyles) => ({
          ...baseStyles,
          padding: 0,
        }),
        indicatorSeparator: () => ({
          display: "none",
        }),
        dropdownIndicator: (baseStyles, state) => ({
          ...baseStyles,
          color: "oklab(0.786807 -0.0025776 -0.0110238)",
          transform: state.selectProps.menuIsOpen
            ? "rotate(180deg)"
            : "rotate(0)",
          "&:hover": {
            color: "oklab(0.786807 -0.0025776 -0.0110238)",
          },
        }),
        menuPortal: (baseStyles) => ({ ...baseStyles, zIndex: 100000 }),
      }}
      />
    </div>
  )
}