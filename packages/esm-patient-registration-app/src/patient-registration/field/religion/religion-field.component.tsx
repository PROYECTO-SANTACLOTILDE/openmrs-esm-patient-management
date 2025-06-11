import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { AutocompletePersonAttributeField } from '../person-attributes/autocomplete-person-attribute-field.component';
import { type RegistrationConfig } from '../../../config-schema';

export function ReligionField() {
  const config = useConfig<RegistrationConfig>();
  const { t } = useTranslation();

  const personAttributeType = {
    uuid: config.fieldConfigurations.religion.personAttributeUuid,
    display: t('religion', 'Religión'),
    name: 'religion',
    description: 'Patient religion',
    format: 'org.openmrs.Concept',
  };

  return (
    <AutocompletePersonAttributeField
      id="religion"
      personAttributeType={personAttributeType}
      answerConceptSetUuid={config.fieldConfigurations.religion.answerConceptSetUuid}
      label={t('religion', 'Religión')}
      customConceptAnswers={[]}
      required={false}
      disabled={false}
    />
  );
}
