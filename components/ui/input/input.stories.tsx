import type { Meta, StoryObj } from '@storybook/nextjs';
import { withTests } from "@storybook/addon-jest";
import results from '../../../.jest-test-results.json';
import { Input } from './input';

 
const meta = {
    title: 'components/ui/input',
    component: Input,
    tags: ['autodocs'],
    decorators: [withTests({ results })],
    parameters: {
        docs: {
            description: {
                component: 'A customizable input component with different types.',
            },
        },
        layout: 'centered',
    }
} satisfies Meta<typeof Input>;
 
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email...',
  },
};

export const Disabled: Story = {
    args: {
        type: 'text',
        placeholder: 'Disabled input...',
        disabled: true,
    },
};
