import React, { useEffect, useState, useMemo } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { PersonAttributeField } from '../person-attributes/person-attribute-field.component';
import { type RegistrationConfig, type FieldDefinition } from '../../../config-schema';
import { useField } from 'formik';
import { usePatientRegistrationContext } from '../../patient-registration-context';

function calculateAge(birthdate: string | Date | undefined): number | null {
  if (!birthdate) return null;
  const birthDateObj = new Date(birthdate);
  if (isNaN(birthDateObj.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
}

export function CivilStatusField() {
  const config = useConfig<RegistrationConfig>();
  const { setFieldValue, values } = usePatientRegistrationContext();

  // Observar el campo de fecha de nacimiento
  const [birthDateField] = useField('birthdate');

  const baseFieldDefinition = useMemo((): FieldDefinition | null => {
    const civilStatusConfig = config.fieldConfigurations?.civilStatus;
    if (!civilStatusConfig) {
      return null;
    }

    return {
      id: 'civilStatus',
      type: 'person attribute',
      uuid: civilStatusConfig.personAttributeUuid,
      label: 'Estado Civil',
      showHeading: false,
      answerConceptSetUuid: civilStatusConfig.answerConceptSetUuid,
      validation: {
        required: false,
      },
    };
  }, [config.fieldConfigurations?.civilStatus]);

  const [currentFieldDefinition, setCurrentFieldDefinition] = useState<FieldDefinition | null>(baseFieldDefinition);

  useEffect(() => {
    if (!baseFieldDefinition || !config.fieldConfigurations?.civilStatus) {
      setCurrentFieldDefinition(baseFieldDefinition);
      return;
    }

    const patientAge = calculateAge(birthDateField.value);
    const marriageableAge = config.fieldConfigurations.civilStatus.marriageableAge;
    const singleStatusConceptUuid = config.fieldConfigurations.civilStatus.singleStatusConceptUuid;

    if (patientAge !== null && patientAge < marriageableAge) {
      setCurrentFieldDefinition({
        ...baseFieldDefinition,
        disabled: true,
      });

      // Establecer el valor a "Soltero" si es diferente para evitar re-renders innecesarios
      const fieldName = `attributes.${baseFieldDefinition.uuid}`;
      const currentValue = values[fieldName] || values.attributes?.[baseFieldDefinition.uuid];
      if (currentValue !== singleStatusConceptUuid) {
        setFieldValue(fieldName, singleStatusConceptUuid);
      }
    } else {
      // Si el campo estaba deshabilitado y ahora no lo está, permitir que el usuario lo cambie
      setCurrentFieldDefinition({
        ...baseFieldDefinition,
        disabled: false,
      });
    }
  }, [birthDateField.value, baseFieldDefinition, config.fieldConfigurations?.civilStatus, setFieldValue, values]);

  if (!currentFieldDefinition) {
    // Si la configuración no está lista o no se encuentra
    return null;
  }

  return <PersonAttributeField fieldDefinition={currentFieldDefinition} />;
}
