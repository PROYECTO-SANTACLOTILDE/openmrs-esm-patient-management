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
    showHeading: false,
  };

  return (
    <AutocompletePersonAttributeField
      fieldDefinition={fieldDefinition}
      placeholder={t('typeEtnia', 'Escriba o seleccione una etnia...')}
    />
  );
}
