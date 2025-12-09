# Comparison Story Example - Visual Regression Testing

This example shows how to create comparison stories to verify that the old style looks the same as the new style after migrating to design tokens.

## File Structure

```
components/analytics/cards/
├── StatsCard.tsx              # Current component (to be migrated)
├── StatsCard.legacy.tsx       # Backup of original component (temporary)
├── StatsCard.stories.tsx      # Normal component stories
└── StatsCard.comparison.stories.tsx  # Before/after comparison stories
```

## Full Example: StatsCard.comparison.stories.tsx

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TrendingUp, Users, Mail, Target } from 'lucide-react';
import { StatsCard as LegacyStatsCard } from './StatsCard.legacy';
import { StatsCard as NewStatsCard } from './StatsCard';

const meta: Meta = {
  title: 'Migration/Analytics/StatsCard Comparison',
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'light',
    },
  },
};

export default meta;

type Story = StoryObj;

/**
 * Side-by-side comparison of a single component
 */
export const BasicComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-lg font-semibold">❌ Legacy (Hardcoded Styles)</h3>
          <span className="text-xs text-gray-500">Before migration</span>
        </div>
        <LegacyStatsCard
          title="Total Users"
          value="1,234"
          change="+12.5%"
          trend="up"
          icon={Users}
        />
      </div>
      
      <div className="border-t pt-8">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-lg font-semibold">✅ New (Design Tokens)</h3>
          <span className="text-xs text-gray-500">After migration</span>
        </div>
        <NewStatsCard
          title="Total Users"
          value="1,234"
          change="+12.5%"
          trend="up"
          icon={Users}
        />
      </div>

      <div className="border-t pt-4 text-sm text-gray-600">
        <p><strong>Verify:</strong></p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Identical colors (green for success)</li>
          <li>Font sizes match</li>
          <li>Internal spacing is equal</li>
          <li>Border and shadow are equal</li>
        </ul>
      </div>
    </div>
  ),
};

/**
 * Comparison of all variants
 */
export const AllVariantsComparison: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      {/* Legacy Column */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">❌ Legacy</h3>
        <div className="space-y-4">
          <LegacyStatsCard
            title="Active Campaigns"
            value="42"
            change="+8.2%"
            trend="up"
            icon={Target}
          />
          <LegacyStatsCard
            title="Email Sent"
            value="12,543"
            change="+15.3%"
            trend="up"
            icon={Mail}
          />
          <LegacyStatsCard
            title="Bounce Rate"
            value="2.4%"
            change="-0.5%"
            trend="down"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* New Column */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">✅ New (Tokens)</h3>
        <div className="space-y-4">
          <NewStatsCard
            title="Active Campaigns"
            value="42"
            change="+8.2%"
            trend="up"
            icon={Target}
          />
          <NewStatsCard
            title="Email Sent"
            value="12,543"
            change="+15.3%"
            trend="up"
            icon={Mail}
          />
          <NewStatsCard
            title="Bounce Rate"
            value="2.4%"
            change="-0.5%"
            trend="down"
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * Dark Mode Comparison
 */
export const DarkModeComparison: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">❌ Legacy - Dark</h3>
        <LegacyStatsCard
          title="Revenue"
          value="$45,231"
          change="+23.1%"
          trend="up"
          icon={TrendingUp}
        />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">✅ New - Dark</h3>
        <NewStatsCard
          title="Revenue"
          value="$45,231"
          change="+23.1%"
          trend="up"
          icon={TrendingUp}
        />
      </div>
    </div>
  ),
};

/**
 * State Comparison (Hover, etc.)
 */
export const InteractiveStatesComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium text-gray-500">
          Hover over cards to verify interactive states
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="mb-2 text-sm">❌ Legacy</p>
          <LegacyStatsCard
            title="Interactive Card"
            value="Hover me"
            icon={Target}
          />
        </div>
        <div>
          <p className="mb-2 text-sm">✅ New</p>
          <NewStatsCard
            title="Interactive Card"
            value="Hover me"
            icon={Target}
          />
        </div>
      </div>
    </div>
  ),
};
```

## Usage Workflow

### 1. Prepare for Migration

```bash
# Change to component directory
cd components/analytics/cards

# Create backup of original component
cp StatsCard.tsx StatsCard.legacy.tsx

# Create comparison stories file
touch StatsCard.comparison.stories.tsx
```

### 2. Create Comparison Story

Copy the template above and adjust according to your component.

### 3. Verify Baseline in Storybook

```bash
# Start Storybook
npm run storybook

# Navigate to: Migration/Analytics/StatsCard Comparison
# Take screenshot or use Chromatic for baseline
```

### 4. Migrate the Component

Edit `StatsCard.tsx` to use design tokens:

```diff
// StatsCard.tsx
+ import { statusColors, textColors } from '@/lib/design-tokens';

- <span className="text-green-600 dark:text-green-400">
+ <span className={statusColors.success}>
```

### 5. Verify Visually

```bash
# Reload Storybook (auto-reload)
# Visually compare both versions in the story
```

**Verification Checklist:**
- [ ] Colors match exactly
- [ ] Text sizes are equal
- [ ] Spacing (padding, gaps) is identical
- [ ] Borders and shadows match
- [ ] Dark mode works in both
- [ ] Hover/active states are equal

### 6. Cleanup

```bash
# If everything looks identical, delete backup
rm StatsCard.legacy.tsx

# Optional: Delete comparison story after approval
# (or keep for historical record)
```

## Additional Tips

### Use Chromatic for Automatic Comparison

```bash
# Install
npm install --save-dev chromatic

# Configure in package.json
"scripts": {
  "chromatic": "chromatic --project-token=YOUR_TOKEN"
}

# Create baseline before migrating
git checkout main
npm run chromatic

# Create build after migrating
git checkout feature/migrate-stats-card
npm run chromatic
# Chromatic will show visual differences automatically
```

### Manual Comparative Screenshot

```bash
# Take screenshots
npm run storybook

# In the browser:
# 1. Open DevTools → Device Toolbar
# 2. Viewport: 1280x720
# 3. Capture screenshot of each story
# 4. Compare with image diff tool
```

## Benefits

✅ **Visual confidence** - Seeing side-by-side confirms correct migration  
✅ **Documentation** - Historical evidence of changes  
✅ **Regression prevention** - Detects differences immediately  
✅ **Dark mode** - Validates both themes simultaneously  
✅ **Team approval** - Easy to review in PRs
