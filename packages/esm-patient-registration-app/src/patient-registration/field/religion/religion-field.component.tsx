import React, { useMemo } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { AutocompletePersonAttributeField } from '../person-attributes/autocomplete-person-attribute-field.component';
import { type RegistrationConfig } from '../../../config-schema';

export function ReligionField() {
  const config = useConfig<RegistrationConfig>();
  const { t } = useTranslation();

  const fieldDefinition = {
    id: 'religion',
    type: 'person attribute',
    uuid: config.fieldConfigurations.religion.personAttributeUuid,
    label: t('religion', 'Religión'),
    answerConceptSetUuid: config.fieldConfigurations.religion.answerConceptSetUuid,
    showHeading: false,
  };

  return (
    <AutocompletePersonAttributeField
      fieldDefinition={fieldDefinition}
      placeholder={t('typeReligion', 'Escriba o seleccione una religión...')}
    />
  );
}
