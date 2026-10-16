import {
  Group,
  Text,
  Button,
  TextInput,
  ActionIcon,
  SegmentedControl,
  Badge,
  Stack,
} from '@mantine/core'
import { Plus, Trash2, ToggleLeft, Type } from 'lucide-react'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { SUB_TYPE } from './categoryConstants'

/**
 * Shared by the category form and the sub-category modal. Both build the same
 * "answer type + options" pair, and keeping it here avoids an import cycle
 * between the two.
 */
export const AnswerTypeControl = ({ value, onChange }) => (
  <Stack gap={4}>
    <Text size='sm' fw={500}>Answer Type</Text>
    <SegmentedControl
      value={value}
      onChange={onChange}
      data={[
        {
          value: SUB_TYPE.boolean,
          label: (
            <Group gap={6} justify='center' wrap='nowrap'>
              <ToggleLeft size={16} />
              <span>Boolean</span>
            </Group>
          ),
        },
        {
          value: SUB_TYPE.string,
          label: (
            <Group gap={6} justify='center' wrap='nowrap'>
              <Type size={16} />
              <span>String</span>
            </Group>
          ),
        },
      ]}
    />
  </Stack>
)

export const OptionsBuilder = ({ form, path, options }) => {
  const [option, setOption] = useState('');
  const error = form.errors[path];

  const onAddOption = () => {
    const value = option.trim();

    if (value.length === 0) return;

    if (options.some((item) => item.toLowerCase() === value.toLowerCase())) {
      notifications.show({
        color: 'red',
        title: 'Duplicate Option',
        message: `"${value}" is already an option of this sub-category.`,
      });
      return;
    }

    form.insertListItem(path, value);
    form.clearFieldError(path);
    setOption('');
  }

  return (
    <Stack gap={8} mt={10}>
      <Group gap={8} align='flex-end'>
        <TextInput
          flex={1}
          label='Options'
          placeholder='Enter option'
          value={option}
          error={error}
          onChange={(e) => setOption(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            onAddOption();
          }}
        />
        <Button variant='light' leftSection={<Plus size={16} />} onClick={onAddOption}>
          ADD OPTION
        </Button>
      </Group>
      {options.length === 0 ? (
        <Text size='xs' c='dimmed'>No options yet. Add at least one option.</Text>
      ) : (
        <Group gap={8}>
          {options.map((item, optionIndex) => (
            <Badge
              key={`${item}-${optionIndex}`}
              size='lg'
              variant='light'
              color='brand'
              rightSection={
                <ActionIcon
                  size='xs'
                  variant='transparent'
                  color='red'
                  onClick={() => form.removeListItem(path, optionIndex)}
                >
                  <Trash2 size={12} />
                </ActionIcon>
              }
            >
              {item}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  );
}
