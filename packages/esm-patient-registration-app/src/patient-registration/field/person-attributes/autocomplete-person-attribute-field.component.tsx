import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';
import { Layer, ComboBox, SkeletonText } from '@carbon/react';
import { reportError } from '@openmrs/esm-framework';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import { useConceptAnswers } from '../field.resource';
import styles from './../field.scss';

export interface AutocompletePersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  answerConceptSetUuid: string;
  label?: string;
  customConceptAnswers: Array<{ uuid: string; label?: string }>;
  required: boolean;
  disabled?: boolean;
}

interface ConceptAnswer {
  id: string;
  text: string;
}

export function AutocompletePersonAttributeField({
  id,
  personAttributeType,
  answerConceptSetUuid,
  label,
  customConceptAnswers,
  required,
  disabled = false,
}: AutocompletePersonAttributeFieldProps) {
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(
    customConceptAnswers.length ? '' : answerConceptSetUuid,
  );

  const { t } = useTranslation();
  const fieldName = `attributes.${personAttributeType.uuid}`;
  const [error, setError] = useState(false);

  // Validation and error handling
  useEffect(() => {
    if (!answerConceptSetUuid && !customConceptAnswers.length) {
      reportError(
        t(
          'autocompletePersonAttributeNoAnswerSet',
          `The person attribute field '{{autocompletePersonAttributeFieldId}}' is of type 'autocomplete' but has been defined without an answer concept set UUID. The 'answerConceptSetUuid' key is required.`,
          { autocompletePersonAttributeFieldId: id },
        ),
      );
      setError(true);
    }
  }, [answerConceptSetUuid, customConceptAnswers, id, t]);

  useEffect(() => {
    if (!isLoadingConceptAnswers && !customConceptAnswers.length) {
      if (!conceptAnswers) {
        reportError(
          t(
            'autocompletePersonAttributeAnswerSetInvalid',
            `The autocomplete person attribute field '{{autocompletePersonAttributeFieldId}}' has been defined with an invalid answer concept set UUID '{{answerConceptSetUuid}}'.`,
            { autocompletePersonAttributeFieldId: id, answerConceptSetUuid },
          ),
        );
        setError(true);
      }
      if (conceptAnswers?.length === 0) {
        reportError(
          t(
            'autocompletePersonAttributeAnswerSetEmpty',
            `The autocomplete person attribute field '{{autocompletePersonAttributeFieldId}}' has been defined with an answer concept set UUID '{{answerConceptSetUuid}}' that does not have any concept answers.`,
            {
              autocompletePersonAttributeFieldId: id,
              answerConceptSetUuid,
            },
          ),
        );
        setError(true);
      }
    }
  }, [isLoadingConceptAnswers, conceptAnswers, customConceptAnswers, t, id, answerConceptSetUuid]);

  // Prepare answers list for ComboBox
  const items = useMemo(() => {
    if (customConceptAnswers.length) {
      return customConceptAnswers.map((answer) => ({
        id: answer.uuid,
        text: answer.label || '',
      }));
    }
    return isLoadingConceptAnswers || !conceptAnswers
      ? []
      : conceptAnswers
          .map((answer) => ({
            id: answer.uuid,
            text: answer.display || '',
          }))
          .sort((a, b) => a.text.localeCompare(b.text));
  }, [customConceptAnswers, conceptAnswers, isLoadingConceptAnswers]);

  if (error) {
    return null;
  }

  if (isLoadingConceptAnswers) {
    return (
      <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
        <SkeletonText />
      </div>
    );
  }

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Layer>
        <Field name={fieldName}>
          {({ field, form: { touched, errors, setFieldValue }, meta }) => {
            const hasError = errors[fieldName] && touched[fieldName];

            return (
              <ComboBox
                id={id}
                titleText={label ?? personAttributeType?.display}
                placeholder={t('searchOrSelect', 'Search or select an option')}
                items={items}
                itemToString={(item) => (item ? item.text : '')}
                selectedItem={items.find((item) => item.id === field.value) || null}
                onChange={({ selectedItem }) => {
                  setFieldValue(fieldName, selectedItem?.id || '');
                }}
                onInputChange={(inputValue) => {
                  // If input doesn't match any item, clear the value
                  const matchingItem = items.find((item) => item.text.toLowerCase() === inputValue.toLowerCase());
                  if (!matchingItem && inputValue !== '') {
                    setFieldValue(fieldName, '');
                  }
                }}
                disabled={disabled}
                invalid={hasError}
                invalidText={hasError ? errors[fieldName] : ''}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.text.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            );
          }}
        </Field>
      </Layer>
    </div>
  );
}
