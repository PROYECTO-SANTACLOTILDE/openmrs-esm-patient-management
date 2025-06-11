import React, { useState, useMemo, useCallback } from 'react';
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
  const [field, meta, helpers] = useField(fieldDefinition.id);
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
    return allOptions.find((option) => option.value === field.value) || null;
  }, [field.value, allOptions]);

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return allOptions;
    
    return allOptions.filter((option) => 
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue, allOptions]);

  const handleSelectionChange = useCallback(({ selectedItem }) => {
    if (selectedItem) {
      helpers.setValue(selectedItem.value);
      setInputValue('');
    } else {
      helpers.setValue('');
    }
    helpers.setTouched(true);
  }, [helpers]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    // If allowOther is enabled and user typed something not in options
    if (fieldDefinition.allowOther && value && !allOptions.some(opt => 
      opt.label.toLowerCase() === value.toLowerCase()
    )) {
      // Save custom value after a delay to avoid excessive updates
      const timeoutId = setTimeout(() => {
        helpers.setValue(value);
        helpers.setTouched(true);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fieldDefinition.allowOther, allOptions, helpers]);

  const shouldFilterItem = useCallback(({ item, inputValue }) => {
    if (!inputValue) return true;
    return item.label.toLowerCase().includes(inputValue.toLowerCase());
  }, []);

  if (isLoading) {
    return (
      <div className="omrs-input-group">
        <InlineLoading description={t('loadingOptions', 'Cargando opciones...')} />
      </div>
    );
  }

  const effectivePlaceholder = placeholder || 
    (fieldDefinition.allowOther 
      ? t('typeOrSelectOption', 'Escriba una opción personalizada o seleccione de la lista')
      : t('selectFromList', 'Seleccione de la lista')
    );

  const helperText = fieldDefinition.allowOther 
    ? t('customValueAllowed', 'Puede escribir una opción personalizada si no encuentra la deseada')
    : t('selectFromAvailableOptions', 'Seleccione una opción de la lista disponible');

  return (
    <div className="omrs-input-group">
      <ComboBox
        id={fieldDefinition.id}
        name={fieldDefinition.id}
        items={filteredOptions}
        itemToString={(item) => item?.label || ''}
        placeholder={effectivePlaceholder}
        titleText={fieldDefinition.label}
        helperText={helperText}
        selectedItem={selectedItem}
        onChange={handleSelectionChange}
        onInputChange={handleInputChange}
        shouldFilterItem={shouldFilterItem}
        allowCustomValue={fieldDefinition.allowOther}
        invalid={meta.touched && !!meta.error}
        invalidText={meta.error}
        disabled={fieldDefinition.disabled}
        size="md"
        direction="bottom"
      />
    </div>
  );
}
