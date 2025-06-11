import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ComboBox, InlineLoading } from '@carbon/react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import { type FieldDefinition } from '../../../config-schema';

interface AutocompletePersonAttributeFieldProps {
  fieldDefinition: FieldDefinition & {
    answerConceptSetUuid?: string;
    allowOther?: boolean;
  };
  predefinedOptions?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface ConceptAnswer {
  uuid: string;
  display: string;
}

interface ConceptSet {
  uuid: string;
  display: string;
  setMembers?: Array<ConceptAnswer>;
  answers?: Array<ConceptAnswer>;
}

export function AutocompletePersonAttributeField({
  fieldDefinition,
  predefinedOptions = [],
  placeholder,
}: AutocompletePersonAttributeFieldProps) {
  const { t } = useTranslation();
  // Use the correct field name format that matches other person attribute fields
  const fieldName = `attributes.${fieldDefinition.uuid}`;
  const [field, meta, helpers] = useField(fieldName);
  const [inputValue, setInputValue] = useState('');

  // Fetch concept answers if answerConceptSetUuid is provided
  const { data: conceptData, isLoading } = useSWR<FetchResponse<ConceptSet>>(
    fieldDefinition.answerConceptSetUuid
      ? `${restBaseUrl}/concept/${fieldDefinition.answerConceptSetUuid}?v=full`
      : null,
    openmrsFetch,
  );

  // Combine predefined options with concept answers
  const allOptions = useMemo(() => {
    const conceptAnswers = conceptData?.data?.setMembers || conceptData?.data?.answers || [];
    const conceptOptions = conceptAnswers.map((answer) => ({
      value: answer.uuid,
      label: answer.display,
    }));

    // Merge predefined options with concept options, removing duplicates
    const combinedOptions = [...predefinedOptions];
    conceptOptions.forEach((conceptOption) => {
      if (!combinedOptions.some((option) => option.value === conceptOption.value)) {
        combinedOptions.push(conceptOption);
      }
    });

    return combinedOptions.sort((a, b) => a.label.localeCompare(b.label));
  }, [conceptData, predefinedOptions]);

  // Find selected item based on current field value
  const selectedItem = useMemo(() => {
    if (!field.value) return null;

    // First try to find by value (UUID or exact match)
    const foundByValue = allOptions.find((option) => option.value === field.value);
    if (foundByValue) return foundByValue;

    // Try to find by label (for reverse lookup)
    const foundByLabel = allOptions.find((option) => option.label === field.value);
    if (foundByLabel) return foundByLabel;

    // For concept-based fields, try to find by display name from the concept data
    if (fieldDefinition.answerConceptSetUuid && conceptData?.data) {
      const conceptAnswers = conceptData.data.setMembers || conceptData.data.answers || [];
      const foundConcept = conceptAnswers.find(
        (answer) => answer.uuid === field.value || answer.display === field.value,
      );
      if (foundConcept) {
        return { value: foundConcept.uuid, label: foundConcept.display };
      }
    }

    // If allowOther is enabled and we have a custom value, create a temporary item
    if (fieldDefinition.allowOther && field.value) {
      return { value: field.value, label: field.value };
    }

    return null;
  }, [field.value, allOptions, fieldDefinition.allowOther, fieldDefinition.answerConceptSetUuid, conceptData]);

  // Sync inputValue with field value when editing existing data
  useEffect(() => {
    if (field.value && !inputValue) {
      // If we have a field value but no input value, we might be loading existing data
      const existingOption = allOptions.find((option) => option.value === field.value);
      if (existingOption) {
        // Don't set inputValue here as it interferes with ComboBox behavior
        // The selectedItem will handle the display
      } else if (fieldDefinition.allowOther) {
        // For custom values, the selectedItem will show the custom value
      }
    }
  }, [field.value, allOptions, inputValue, fieldDefinition.allowOther]);

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return allOptions;

    return allOptions.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
  }, [inputValue, allOptions]);

  const handleSelectionChange = useCallback(
    ({ selectedItem }) => {
      if (selectedItem) {
        helpers.setValue(selectedItem.value);
        setInputValue('');
      } else {
        // Clear the field when no item is selected
        helpers.setValue('');
        setInputValue('');
      }
      helpers.setTouched(true);
    },
    [helpers],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);

      // If the input is empty, clear the field
      if (!value || value.trim() === '') {
        helpers.setValue('');
        helpers.setTouched(true);
        return;
      }

      // For allowOther mode, we don't automatically set values from typing
      // Let the user type freely and only set value on explicit selection or blur
      if (fieldDefinition.allowOther) {
        // Don't automatically set values while typing
        return;
      }

      // For non-allowOther mode, only set value if there's an exact match
      const exactMatch = allOptions.find((opt) => opt.label.toLowerCase() === value.toLowerCase());
      if (exactMatch) {
        helpers.setValue(exactMatch.value);
        helpers.setTouched(true);
      }
    },
    [fieldDefinition.allowOther, allOptions, helpers],
  );

  const shouldFilterItem = useCallback(({ item, inputValue }) => {
    if (!inputValue) return true;
    return item.label.toLowerCase().includes(inputValue.toLowerCase());
  }, []);

  const handleBlur = useCallback(() => {
    // When allowOther is enabled and user has typed something that doesn't match existing options
    // save the custom value on blur
    if (fieldDefinition.allowOther && inputValue && !field.value) {
      const exactMatch = allOptions.find((opt) => opt.label.toLowerCase() === inputValue.toLowerCase());
      if (!exactMatch) {
        helpers.setValue(inputValue);
        helpers.setTouched(true);
      }
    }
  }, [fieldDefinition.allowOther, inputValue, field.value, allOptions, helpers]);

  if (isLoading) {
    return (
      <div className="omrs-input-group">
        <InlineLoading description={t('loadingOptions', 'Cargando opciones...')} />
      </div>
    );
  }

  const effectivePlaceholder =
    placeholder ||
    (fieldDefinition.allowOther
      ? t('typeOrSelectOption', 'Escriba una opción personalizada o seleccione de la lista')
      : t('selectFromList', 'Seleccione de la lista'));

  const helperText = fieldDefinition.allowOther
    ? t('customValueAllowed', 'Puede escribir una opción personalizada si no encuentra la deseada')
    : t('selectFromAvailableOptions', 'Seleccione una opción de la lista disponible');

  return (
    <div className="omrs-input-group">
      <ComboBox
        id={fieldDefinition.id}
        name={fieldName}
        items={filteredOptions}
        itemToString={(item) => item?.label || ''}
        placeholder={effectivePlaceholder}
        titleText={fieldDefinition.label}
        helperText={helperText}
        selectedItem={selectedItem}
        onChange={handleSelectionChange}
        onInputChange={handleInputChange}
        onBlur={handleBlur}
        shouldFilterItem={shouldFilterItem}
        allowCustomValue={fieldDefinition.allowOther}
        invalid={meta.touched && !!meta.error}
        invalidText={meta.error}
        disabled={fieldDefinition.disabled}
        size="md"
        direction="bottom"
        light={false}
        warn={false}
        warnText=""
      />
    </div>
  );
}
