import { randomId } from '@mantine/hooks';

const SUB_TYPE = {
  boolean: 'boolean',
  string: 'string',
};

/**
 * The form works in camelCase, the API contract is snake_case (Newtonsoft
 * JsonProperty names on DocumentCategory.cs). Options only travel when the
 * answer type is "string" - a boolean answer has no option list.
 */
export const toDocumentCategoryPayload = (values) => {
  const hasSubCategories = Boolean(values.hasSubCategories);

  return {
    name: (values.name ?? '').trim(),
    has_sub_categories: hasSubCategories,
    type: hasSubCategories ? null : values.type,
    options:
      !hasSubCategories && values.type === SUB_TYPE.string
        ? values.options ?? []
        : [],
    sub_categories: hasSubCategories
      ? (values.subCategories ?? []).map((subCategory) => ({
          name: (subCategory.name ?? '').trim(),
          type: subCategory.type,
          options:
            subCategory.type === SUB_TYPE.string ? subCategory.options ?? [] : [],
        }))
      : [],
  };
};

/**
 * Inverse of toDocumentCategoryPayload - turns a category returned by
 * GET /DocumentSetup/{id} back into the shape useForm expects. Sub-categories
 * get a fresh randomId key since the server has no notion of the form key.
 */
export const toDocumentCategoryForm = (category) => {
  if (!category) {
    return {
      name: '',
      hasSubCategories: false,
      type: SUB_TYPE.boolean,
      options: [],
      subCategories: [],
    };
  }

  return {
    name: category.name ?? '',
    hasSubCategories: Boolean(category.has_sub_categories),
    type: category.type ?? SUB_TYPE.boolean,
    options: category.options ?? [],
    subCategories: (category.sub_categories ?? []).map((subCategory) => ({
      key: randomId(),
      id: subCategory.id,
      name: subCategory.name ?? '',
      type: subCategory.type ?? SUB_TYPE.boolean,
      options: subCategory.options ?? [],
    })),
  };
};
