import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  ThemeIcon,
  Badge,
  Progress,
  SimpleGrid,
  Grid,
  Skeleton,
  Alert,
  Tooltip,
} from "@mantine/core";
import { BarChart, DonutChart } from '@mantine/charts';
import {
  CalendarCheck2,
  LandmarkIcon,
  KeyRoundIcon,
  AlertCircleIcon,
} from 'lucide-react';
import useFeedbackAnsweredSurveys from "~/hooks/HomeBuyerFeedback/useFeedbackAnsweredSurveys";
import useFeedbackQuestionPercentage from "~/hooks/HomeBuyerFeedback/useFeedbackQuestionPercentage";
import useFeedbackHiPlusAnswers from "~/hooks/HomeBuyerFeedback/useFeedbackHiPlusAnswers";
import useFeedbackLoanOverallSatisfactory from "~/hooks/HomeBuyerFeedback/useFeedbackLoanOverallSatisfactory";

const TYPE_META = {
  Reservation: { label: 'Reservation', icon: CalendarCheck2, color: 'brand' },
  Loan: { label: 'Loan Processing', icon: LandmarkIcon, color: 'indigo' },
  Turnover: { label: 'Turnover', icon: KeyRoundIcon, color: 'cyan' },
};

const TYPE_ORDER = ['Reservation', 'Loan', 'Turnover'];

const FeedbackMetricCard = ({ type, total, overall }) => {
  const meta = TYPE_META[type] ?? { label: type, icon: CalendarCheck2, color: 'gray' };
  const Icon = meta.icon;
  const responseRate = overall > 0 ? (total / overall) * 100 : 0;

  return (
    <Card p="lg">
      <Group justify="space-between" align="flex-start">
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
          {meta.label}
        </Text>
        <ThemeIcon variant="light" color={meta.color} size="lg" radius="md">
          <Icon size={18} />
        </ThemeIcon>
      </Group>
      <Group align="flex-end" gap="xs" mt="md">
        <Text fz="3xl" fw={700} lh={1}>
          {total.toLocaleString()}
        </Text>
        <Text size="sm" c="dimmed" fw={500}>
          of {overall.toLocaleString()} sent
        </Text>
      </Group>
      <Group justify="space-between" mt="md" mb="2xs">
        <Text size="xs" c="dimmed">Answered surveys</Text>
        <Text size="xs" fw={600}>{responseRate.toFixed(1)}%</Text>
      </Group>
      <Progress value={responseRate} color={meta.color} size="sm" radius="xl" />
    </Card>
  );
};

const QuestionBreakdownCard = ({ type, items }) => {
  const meta = TYPE_META[type] ?? { label: type, color: 'gray' };
  const percentages = items.map((item) => parseFloat(item.percentage) || 0);
  const average = percentages.length
    ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length
    : 0;

  return (
    <Card p="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600}>{meta.label}</Text>
        <Badge variant="light" color={meta.color} size="sm">
          Avg {average.toFixed(1)}%
        </Badge>
      </Group>
      <Stack gap="sm">
        {items.map((item, index) => (
          <div key={item.questionId}>
            <Group justify="space-between" wrap="nowrap" mb={4}>
              <Tooltip
                label={item.question.trim()}
                multiline
                w={320}
                withArrow
                position="top-start"
              >
                <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                  <Text component="span" c="dimmed" fw={600} mr={6}>
                    {item.questionId}
                  </Text>
                  {item.question.trim()}
                </Text>
              </Tooltip>
              <Text size="sm" fw={600}>
                {percentages[index].toFixed(2)}%
              </Text>
            </Group>
            <Progress
              value={percentages[index]}
              color={meta.color}
              size="sm"
              radius="xl"
            />
          </div>
        ))}
      </Stack>
    </Card>
  );
};

const HIPLUS_ANSWER_COLORS = {
  'Yes': 'teal.5',
  'Not yet': 'gray.5',
};

const HiPlusAnswersCard = ({ question, items }) => {
  const data = items.map((item) => ({
    name: item.answer,
    value: parseInt(item.total, 10) || 0,
    color: HIPLUS_ANSWER_COLORS[item.answer] ?? 'brand.5',
  }));
  const totalAnswers = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card p="lg" h="100%">
      <div>
        <Text fw={600}>Hi Plus Mobile App</Text>
        <Text size="xs" c="dimmed">{question.trim()}</Text>
      </div>
      <Group justify="center" my="lg">
        <DonutChart
          data={data}
          thickness={26}
          size={180}
          paddingAngle={2}
          tooltipDataSource="segment"
          chartLabel={`${totalAnswers.toLocaleString()} answers`}
        />
      </Group>
      <Stack gap="2xs">
        {data.map((item) => (
          <Group key={item.name} justify="space-between">
            <Group gap="xs">
              <ThemeIcon size={10} radius="xl" color={item.color} />
              <Text size="sm">{item.name}</Text>
            </Group>
            <Text size="sm" fw={600}>
              {item.value.toLocaleString()}
              <Text component="span" size="sm" c="dimmed" fw={500} ml={6}>
                ({totalAnswers > 0 ? ((item.value / totalAnswers) * 100).toFixed(1) : 0}%)
              </Text>
            </Text>
          </Group>
        ))}
      </Stack>
    </Card>
  );
};

const LoanSatisfactionCard = ({ items }) => {
  const question = items[0]?.question?.trim() ?? '';
  const totalResponses = items.reduce((sum, item) => sum + item.total, 0);
  const weightedSum = items.reduce((sum, item) => sum + item.answer * item.total, 0);
  const averageRating = totalResponses > 0 ? weightedSum / totalResponses : 0;

  const data = [...items]
    .sort((a, b) => a.answer - b.answer)
    .map((item) => ({ rating: `${item.answer} ★`, Responses: item.total }));

  return (
    <Card p="lg" h="100%">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={600}>Loan Overall Satisfaction</Text>
          <Text size="xs" c="dimmed">{question}</Text>
        </div>
        <Badge variant="light" color={TYPE_META.Loan.color} size="lg">
          {averageRating.toFixed(2)} / 5
        </Badge>
      </Group>
      <BarChart
        h={280}
        mt="lg"
        data={data}
        dataKey="rating"
        series={[{ name: 'Responses', color: `${TYPE_META.Loan.color}.5` }]}
        barProps={{ radius: [4, 4, 0, 0] }}
        gridAxis="y"
      />
      <Text size="xs" c="dimmed" mt="md" ta="center">
        Based on {totalResponses.toLocaleString()} responses
      </Text>
    </Card>
  );
};

const sortByType = (list = []) =>
  [...list].sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
  );

const FeedbackForms = () => {
  const answeredSurveys = useFeedbackAnsweredSurveys();
  const questionPercentage = useFeedbackQuestionPercentage();
  const hiPlusAnswers = useFeedbackHiPlusAnswers();
  const loanSatisfaction = useFeedbackLoanOverallSatisfactory();

  const surveys = sortByType(answeredSurveys.data?.body);
  const questions = sortByType(questionPercentage.data?.body);
  const hiPlus = hiPlusAnswers.data?.body ?? [];
  const loanRatings = loanSatisfaction.data?.body ?? [];

  const hasError =
    answeredSurveys.isError ||
    questionPercentage.isError ||
    hiPlusAnswers.isError ||
    loanSatisfaction.isError;

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>HomeBuyer Feedback</Title>
        <Text c="dimmed" size="sm">Here are the satisfactory metrics for today</Text>
      </div>

      {hasError && (
        <Alert
          variant="light"
          color="red"
          icon={<AlertCircleIcon size={18} />}
          title="Unable to load feedback metrics"
        >
          Something went wrong while fetching the survey data. Please try again later.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {answeredSurveys.isLoading
          ? TYPE_ORDER.map((type) => <Skeleton key={type} h={180} radius="md" />)
          : surveys.map((item) => (
            <FeedbackMetricCard key={item.type} {...item} />
          ))}
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          {loanSatisfaction.isLoading
            ? <Skeleton h="100%" mih={380} radius="md" />
            : loanRatings.length > 0 && <LoanSatisfactionCard items={loanRatings} />}
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          {hiPlusAnswers.isLoading
            ? <Skeleton h="100%" mih={380} radius="md" />
            : hiPlus.map((group) => (
              <HiPlusAnswersCard
                key={group.question}
                question={group.question}
                items={group.items}
              />
            ))}
        </Grid.Col>
      </Grid>

      <div>
        <Text fw={600}>Satisfaction per Question</Text>
        <Text size="xs" c="dimmed">Average satisfaction score for each survey question by stage</Text>
      </div>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {questionPercentage.isLoading
          ? TYPE_ORDER.map((type) => <Skeleton key={type} h={320} radius="md" />)
          : questions.map((group) => (
            <QuestionBreakdownCard
              key={group.type}
              type={group.type}
              items={group.items}
            />
          ))}
      </SimpleGrid>
    </Stack>
  );
};

export default FeedbackForms;
