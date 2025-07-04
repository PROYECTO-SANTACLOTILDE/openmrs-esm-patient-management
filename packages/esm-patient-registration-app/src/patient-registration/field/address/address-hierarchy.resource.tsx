import { useCallback, useEffect, useMemo } from 'react';
import { useField } from 'formik';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, useDebounce } from '@openmrs/esm-framework';
import { usePatientRegistrationContext } from '../../patient-registration-context';

interface AddressFields {
  addressField: string;
}

export function useOrderedAddressHierarchyLevels() {
  const url = '/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form';
  const { data, isLoading, error } = useSWRImmutable<FetchResponse<Array<AddressFields>>, Error>(url, openmrsFetch);

  const results = useMemo(
    () => ({
      orderedFields: data?.data?.map((field) => field.addressField),
      isLoadingFieldOrder: isLoading,
      errorFetchingFieldOrder: error,
    }),
    [data, isLoading, error],
  );

  return results;
}

export function useAddressEntries(fetchResults, searchString) {
  // Optimización: Debounce para evitar consultas excesivas
  const debouncedSearchString = useDebounce(searchString, 300);
  const encodedSearchString = encodeURIComponent(debouncedSearchString);

  // Solo hacer consulta si hay texto para buscar y fetchResults es true
  const shouldFetch = fetchResults && debouncedSearchString.length > 0;

  const { data, isLoading, error } = useSWRImmutable<FetchResponse<Array<{ name: string }>>>(
    shouldFetch
      ? `module/addresshierarchy/ajax/getChildAddressHierarchyEntries.form?searchString=${encodedSearchString}&limit=50`
      : null,
    openmrsFetch,
  );

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const results = useMemo(
    () => ({
      entries: data?.data?.map((item) => item.name)?.slice(0, 20) || [], // Limitar a 20 resultados
      isLoadingAddressEntries: isLoading,
      errorFetchingAddressEntries: error,
    }),
    [data, isLoading, error],
  );
  return results;
}

/**
 * This hook is being used to fetch ordered address fields as configured in the address hierarchy
 * This hook returns the valid search term for valid fields to get suitable entries for the field
 * This also returns the function to reset the lower ordered fields if the value of a field is changed.
 */
export function useAddressEntryFetchConfig(addressField: string) {
  const { orderedFields, isLoadingFieldOrder } = useOrderedAddressHierarchyLevels();
  const { setFieldValue } = usePatientRegistrationContext();
  const [, { value: addressValues }] = useField('address');

  const index = useMemo(
    () => (!isLoadingFieldOrder ? orderedFields.findIndex((field) => field === addressField) : -1),
    [orderedFields, addressField, isLoadingFieldOrder],
  );

  const addressFieldSearchConfig = useMemo(() => {
    let fetchEntriesForField = true;
    const previousSelectedFields = orderedFields?.slice(0, index) ?? [];
    let previousSelectedValues = [];
    for (const fieldName of previousSelectedFields) {
      if (!addressValues[fieldName]) {
        fetchEntriesForField = false;
        break;
      }
      previousSelectedValues.push(addressValues[fieldName]);
    }
    return {
      fetchEntriesForField,
      searchString: previousSelectedValues.join('|'),
    };
  }, [orderedFields, index, addressValues]);

  const updateChildElements = useCallback(() => {
    if (isLoadingFieldOrder) {
      return;
    }
    orderedFields.slice(index + 1).map((fieldName) => {
      setFieldValue(`address.${fieldName}`, '');
    });
  }, [index, isLoadingFieldOrder, orderedFields, setFieldValue]);

  const results = useMemo(
    () => ({
      ...addressFieldSearchConfig,
      updateChildElements,
    }),
    [addressFieldSearchConfig, updateChildElements],
  );

  return results;
}

export function useAddressHierarchy(searchString: string, separator: string) {
  // Optimización: Debounce para evitar consultas excesivas
  const debouncedSearchString = useDebounce(searchString, 500);

  // Solo hacer consulta si hay al menos 2 caracteres
  const shouldSearch = debouncedSearchString.trim().length >= 2;

  const { data, error, isLoading } = useSWRImmutable<
    FetchResponse<
      Array<{
        address: string;
      }>
    >,
    Error
  >(
    shouldSearch
      ? `/module/addresshierarchy/ajax/getPossibleFullAddresses.form?separator=${encodeURIComponent(
          separator,
        )}&searchString=${encodeURIComponent(debouncedSearchString)}&limit=30`
      : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      addresses: data?.data?.map((address) => address.address) ?? [],
      error,
      isLoading,
    }),
    [data?.data, error, isLoading],
  );
  return results;
}

export function useAddressHierarchyWithParentSearch(addressField: string, parentid: string, query: string) {
  const { data, error, isLoading } = useSWRImmutable<
    FetchResponse<
      Array<{
        uuid: string;
        name: string;
      }>
    >,
    Error
  >(
    query
      ? `/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form?addressField=${addressField}&limit=20&searchString=${query}&parentUuid=${parentid}`
      : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      error: error,
      isLoading,
      addresses: data?.data ?? [],
    }),
    [data?.data, error, isLoading],
  );

  return results;
}
