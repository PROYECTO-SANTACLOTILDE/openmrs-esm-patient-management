import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { AutocompletePersonAttributeField } from '../person-attributes/autocomplete-person-attribute-field.component';
import { type RegistrationConfig } from '../../../config-schema';

export function EtniaField() {
  const config = useConfig<RegistrationConfig>();
  const { t } = useTranslation();

  const personAttributeType = {
    uuid: config.fieldConfigurations.etnia.personAttributeUuid,
    display: t('etnia', 'Etnia'),
    name: 'etnia',
    description: 'Patient ethnicity',
    format: 'org.openmrs.Concept',
  };

  return (
    <AutocompletePersonAttributeField
      id="etnia"
      personAttributeType={personAttributeType}
      answerConceptSetUuid={config.fieldConfigurations.etnia.answerConceptSetUuid}
      label={t('etnia', 'Etnia')}
      customConceptAnswers={[]}
      required={false}
      disabled={false}
    />
  );
}
