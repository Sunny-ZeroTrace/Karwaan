export const preferenceOptions = [
  'Animal Welfare',
  'Community Support',
  'Education',
  'Environmental Initiatives',
  'Events & Ground Support',
] as const;

export const availabilityOptions = [
  'Weekdays',
  'Weekends',
  'Both weekdays and weekends',
  'Depends on the activity',
] as const;

export const scenarioQuestions = [
  {
    key: 'scenario1',
    label: 'When something unexpected goes wrong',
    prompt:
      'Imagine you are volunteering at a Karwaan Foundation activity and something unexpected goes wrong. For example, there are fewer volunteers than expected, people are confused about what to do, or the planned arrangement is not working. What would you do?',
  },
  {
    key: 'scenario2',
    label: 'When nobody tells you how',
    prompt:
      'You are given a task to help Karwaan Foundation, but nobody tells you exactly how to do it. How would you figure out what needs to be done, and what steps would you take to complete it successfully?',
  },
  {
    key: 'scenario3',
    label: 'When you spot a problem that is not yours',
    prompt:
      'Suppose you notice a problem during a volunteer activity that is not directly assigned to you, but solving it could improve the situation. What would you do, and how would you handle it?',
  },
] as const;
