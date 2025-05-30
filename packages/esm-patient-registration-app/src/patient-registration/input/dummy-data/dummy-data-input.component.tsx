import React from 'react';
import classNames from 'classnames';
import { v4 } from 'uuid';
import { type FormValues } from '../../patient-registration.types';
import styles from './../input.scss';

interface DummyDataInputProps {
  setValues(values: FormValues, shouldValidate?: boolean): void;
}

export const dummyFormValues: FormValues = {
  patientUuid: v4(),
  givenName: 'John',
  middleName: '',
  fathersFamilyName: 'Smith',
  mothersFamilyName: 'Maroon',
  additionalGivenName: 'Joey',
  additionalMiddleName: '',
  additionalFathersFamilyName: 'Smitty',
  additionalMothersFamilyName: 'Doe',
  addNameInLocalLanguage: true,
  gender: 'Male',
  birthdate: new Date(2020, 1, 1) as any,
  yearsEstimated: 1,
  monthsEstimated: 2,
  birthdateEstimated: true,
  telephoneNumber: '0800001066',
  isDead: false,
  deathDate: '',
  deathTime: '',
  deathTimeFormat: 'AM',
  deathCause: '',
  nonCodedCauseOfDeath: '',
  relationships: [],
  address: {
    address1: 'Bom Jesus Street',
    address2: '',
    cityVillage: 'Recife',
    stateProvince: 'Pernambuco',
    country: 'Brazil',
    postalCode: '50030-310',
  },
  identifiers: {},
};

export const DummyDataInput: React.FC<DummyDataInputProps> = ({ setValues }) => {
  return (
    <main>
      <button
        className={classNames('omrs-btn omrs-filled-neutral', styles.dummyData)}
        onClick={() => setValues(dummyFormValues)}
        type="button"
        aria-label="Dummy Data Input">
        Input Dummy Data
      </button>
    </main>
  );
};
