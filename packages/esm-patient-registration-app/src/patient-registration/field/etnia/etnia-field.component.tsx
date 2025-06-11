import React, { useMemo } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { AutocompletePersonAttributeField } from '../person-attributes/autocomplete-person-attribute-field.component';
import { type RegistrationConfig } from '../../../config-schema';

export function EtniaField() {
  const config = useConfig<RegistrationConfig>();
  const { t } = useTranslation();

  const fieldDefinition = {
    id: 'etnia',
    type: 'person attribute',
    uuid: config.fieldConfigurations.etnia.personAttributeUuid,
    label: t('etnia', 'Etnia'),
    answerConceptSetUuid: config.fieldConfigurations.etnia.answerConceptSetUuid,
    allowOther: config.fieldConfigurations.etnia.allowOther,
    validation: config.fieldConfigurations.etnia.validation,
    showHeading: false,
  };

  // Etnias más comunes en Perú
  const commonEtnias = useMemo(() => [
    { value: 'mestizo', label: 'Mestizo' },
    { value: 'quechua', label: 'Quechua' },
    { value: 'aymara', label: 'Aymara' },
    { value: 'amazonica', label: 'Amazónica (Nativo)' },
    { value: 'afrodescendiente', label: 'Afrodescendiente' },
    { value: 'blanco', label: 'Blanco' },
    { value: 'asiatico', label: 'Asiático' },
    { value: 'shipibo', label: 'Shipibo' },
    { value: 'ashaninka', label: 'Asháninka' },
    { value: 'awajun', label: 'Awajún' },
    { value: 'achuar', label: 'Achuar' },
    { value: 'cocama', label: 'Cocama' },
    { value: 'chayahuita', label: 'Chayahuita' },
    { value: 'aguaruna', label: 'Aguaruna' },
    { value: 'matsigenka', label: 'Matsiguenga' },
    { value: 'bora', label: 'Bora' },
    { value: 'yagua', label: 'Yagua' },
    { value: 'tikuna', label: 'Tikuna' },
    { value: 'otro', label: 'Otro' },
    { value: 'no-especifica', label: 'Prefiere no especificar' },
  ], []);

  return (
    <AutocompletePersonAttributeField
      fieldDefinition={fieldDefinition}
      predefinedOptions={commonEtnias}
      placeholder={t('typeEtnia', 'Escriba o seleccione una etnia...')}
    />
  );
}
