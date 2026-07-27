import {
  Anchor,
  Blockquote,
  Box,
  Breadcrumbs,
  Card,
  Code,
  Container,
  Divider,
  Group,
  List,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Children } from 'react';
import { Link } from 'react-router';
import { ChevronRight, InfoIcon, MessageCircleQuestion } from 'lucide-react';
import StringRoutes from '~/constants/StringRoutes';
import Guide from './UserGuide.md';

// Markdown image sources are relative to the .mdx file, which the browser can't
// resolve from the route URL. Resolve them to real bundled asset URLs instead, so
// the same paths keep working in a plain markdown preview and in the app.
const guideImages = import.meta.glob('./guide-images/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const resolveImage = (src = '') =>
  guideImages[src] ?? guideImages[`./guide-images/${src.split('/').pop()}`] ?? src;

// Plain-text slug for heading anchors, matching the in-document links (#4-per-form-differences)
const flatten = (node) =>
  Array.isArray(node)
    ? node.map(flatten).join('')
    : typeof node === 'object' && node !== null
      ? flatten(node.props?.children)
      : String(node ?? '');

const slug = (children) =>
  flatten(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const heading = (order, props) => ({ children, ...rest }) => (
  <Title id={slug(children)} order={order} {...props} {...rest}>
    {children}
  </Title>
);

// Screenshots sit on a light card so they stay readable in dark mode too.
const MdxImage = ({ src, alt }) => (
  <Paper withBorder radius="md" p="sm" my="md" bg="white">
    <img src={resolveImage(src)} alt={alt} style={{ width: '100%', display: 'block' }} />
    {alt && (
      <Text size="xs" c="dimmed" ta="center" mt="xs">
        {alt}
      </Text>
    )}
  </Paper>
);

// Markdown wraps a standalone image in a paragraph. MdxImage renders a div, which is
// invalid inside <p>, so unwrap image-only paragraphs instead of nesting them.
const isImageOnly = (children) => {
  const items = Children.toArray(children);
  return items.length === 1 && items[0]?.type === MdxImage;
};

const components = {
  h1: heading(1, { mb: 'xs' }),
  h2: heading(2, { mt: 'xl', mb: 'sm' }),
  h3: heading(3, { mt: 'lg', mb: 'xs' }),
  h4: heading(4, { mt: 'md', mb: '2xs', c: 'brand' }),
  p: ({ children, ...rest }) =>
    isImageOnly(children) ? (
      children
    ) : (
      <Text size="sm" my="sm" style={{ lineHeight: 1.7 }} {...rest}>
        {children}
      </Text>
    ),
  a: ({ href, ...rest }) => <Anchor href={href} size="sm" {...rest} />,
  ul: (props) => <List size="sm" spacing="xs" my="sm" {...props} />,
  ol: (props) => <List type="ordered" size="sm" spacing="xs" my="sm" {...props} />,
  li: (props) => <List.Item {...props} />,
  code: (props) => <Code {...props} />,
  hr: () => <Divider my="xl" />,
  strong: (props) => <Text component="strong" fw={700} inherit {...props} />,
  blockquote: ({ children }) => (
    <Blockquote
      color="brand"
      icon={<InfoIcon size={18} />}
      iconSize={32}
      my="md"
      p="md"
      styles={{ root: { fontSize: 'var(--mantine-font-size-sm)' } }}
    >
      {children}
    </Blockquote>
  ),
  img: MdxImage,
  table: (props) => (
    <Table.ScrollContainer minWidth={480} my="md">
      <Table striped withTableBorder highlightOnHover verticalSpacing="xs" fz="sm" {...props} />
    </Table.ScrollContainer>
  ),
  thead: (props) => <Table.Thead {...props} />,
  tbody: (props) => <Table.Tbody {...props} />,
  tr: (props) => <Table.Tr {...props} />,
  th: (props) => <Table.Th {...props} />,
  td: (props) => <Table.Td {...props} />,
};

const UserGuidePage = () => {
  const crumbs = [
    { title: 'HomeBuyer Feedback', href: StringRoutes.feedback },
    { title: 'User Guide', href: null },
  ].map((item, index) => (
    <Anchor
      key={index}
      size="xs"
      component={Link}
      to={item.href}
      c={item.href ? 'var(--primary)' : 'dimmed'}
      viewTransition
      style={{ fontFamily: 'monospace', viewTransitionName: item.title }}
    >
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid size="md" p={0}>
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon variant="light" color="brand" size="lg" radius="md">
            <MessageCircleQuestion size={18} />
          </ThemeIcon>
          <Breadcrumbs p={0} separator={<ChevronRight size={12} />} separatorMargin={2}>
            {crumbs}
          </Breadcrumbs>
        </Group>

        <Card p="xl" radius="md">
          <Box>
            <Guide components={components} />
          </Box>
        </Card>
      </Stack>
    </Container>
  );
};

export default UserGuidePage;
