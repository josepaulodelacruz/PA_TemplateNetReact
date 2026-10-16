import { Select, Loader } from '@mantine/core'
import { useDocumentContext } from '../context';

const DocLabel = ({ error: fieldError, ...props }) => {
  const { tabLabels, isLoading, isError, error } = useDocumentContext();

  return (
    <Select
      disabled={isError || isLoading}
      label="Document Type"
      size="lg"
      placeholder={isLoading ? 'Loading document types...' : 'Select document type'}
      rightSection={isLoading ? <Loader size="xs" /> : undefined}
      /*THE FETCH ERROR WINS - THERE IS NOTHING TO PICK WHEN THE LABELS NEVER ARRIVED*/
      error={isError ? (error?.response?.data?.message ?? error?.message) : fieldError}
      data={tabLabels}
      searchable
      clearable
      {...props}
    />
  );
}

export default DocLabel;
