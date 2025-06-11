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
    allowOther: config.fieldConfigurations.religion.allowOther,
    validation: config.fieldConfigurations.religion.validation,
    showHeading: false,
  };

  // Religiones más comunes en Perú
  const commonReligions = useMemo(() => [
    { value: 'catolica', label: 'Católica' },
    { value: 'catolica-romana', label: 'Católica Romana' },
    { value: 'evangelica', label: 'Evangélica' },
    { value: 'evangelica-pentecostal', label: 'Evangélica Pentecostal' },
    { value: 'adventista', label: 'Adventista del Séptimo Día' },
    { value: 'testigo-jehova', label: 'Testigo de Jehová' },
    { value: 'mormon', label: 'Mormón (Iglesia de Jesucristo)' },
    { value: 'bautista', label: 'Bautista' },
    { value: 'metodista', label: 'Metodista' },
    { value: 'presbiteriana', label: 'Presbiteriana' },
    { value: 'luterana', label: 'Luterana' },
    { value: 'anglicana', label: 'Anglicana' },
    { value: 'ortodoxa', label: 'Ortodoxa' },
    { value: 'budista', label: 'Budista' },
    { value: 'hinduista', label: 'Hinduista' },
    { value: 'judaica', label: 'Judía' },
    { value: 'islamica', label: 'Islámica' },
    { value: 'sikh', label: 'Sikh' },
    { value: 'bahai', label: "Bahá'í" },
    { value: 'cristianismo-oriental', label: 'Cristianismo Oriental' },
    { value: 'espiritualista', label: 'Espiritualista' },
    { value: 'esoterica', label: 'Esotérica' },
    { value: 'otra-cristiana', label: 'Otra Cristiana' },
    { value: 'otra', label: 'Otra religión' },
    { value: 'ninguna', label: 'Ninguna/No religiosa' },
    { value: 'agnostica', label: 'Agnóstica' },
    { value: 'atea', label: 'Atea' },
    { value: 'no-especifica', label: 'Prefiere no especificar' },
  ], []);

  return (
    <AutocompletePersonAttributeField
      fieldDefinition={fieldDefinition}
      predefinedOptions={commonReligions}
      placeholder={t('typeReligion', 'Escriba o seleccione una religión...')}
    />
  );
}
