import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'gs-1',
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'To create an account, click on the "Sign Up" button on the login page. Enter your email address, create a password, and provide your full name. Once you verify your email, your account will be activated and you can start using Fleety.',
  },
  {
    id: 'gs-2',
    category: 'Getting Started',
    question: 'What information do I need to add a vehicle?',
    answer: 'To add a vehicle, you need: Make (e.g., Toyota), Model (e.g., Camry), Year, Color (optional), License Plate (optional), Current Mileage, and VIN (optional). All required fields must be filled to add the vehicle successfully.',
  },
  {
    id: 'gs-3',
    category: 'Getting Started',
    question: 'Can I add multiple vehicles?',
    answer: 'Yes! Fleety allows you to manage unlimited vehicles under one account. Each vehicle has its own maintenance history, reminders, and reports. You can easily switch between vehicles from the dashboard.',
  },
  {
    id: 'gs-4',
    category: 'Getting Started',
    question: 'How do I log in to my account?',
    answer: 'Visit the login page and enter the email address and password you used during sign-up. If you forget your password, click "Forgot Password" to reset it via email.',
  },

  // Maintenance Records
  {
    id: 'mr-1',
    category: 'Maintenance Records',
    question: 'How do I add a maintenance record?',
    answer: 'Navigate to the Maintenance page and click "Add Maintenance" or go to a specific vehicle and add a service record. Fill in the date, type of service, description, cost, and mileage. You can also add notes and the service provider name.',
  },
  {
    id: 'mr-2',
    category: 'Maintenance Records',
    question: 'What maintenance types are available?',
    answer: 'Available maintenance types include: Oil Change, Tire Rotation, Brake Service, Inspection, Repair, and Other. Choose the most relevant type for your service or select "Other" for unlisted services.',
  },
  {
    id: 'mr-3',
    category: 'Maintenance Records',
    question: 'Can I edit or delete maintenance records?',
    answer: 'Yes, you can edit or delete maintenance records. Go to your vehicle details, find the record in the maintenance history, and use the edit or delete option. Changes are saved immediately.',
  },
  {
    id: 'mr-4',
    category: 'Maintenance Records',
    question: 'How do I track maintenance costs?',
    answer: 'All maintenance costs are automatically tracked and displayed in the Reports section. You can see total spending, average cost per service, and view cost trends over time. Currency preferences can be set in Settings.',
  },

  // Reminders
  {
    id: 'rem-1',
    category: 'Reminders',
    question: 'How do I set up service reminders?',
    answer: 'Go to a vehicle\'s details page, navigate to the Reminders tab, and click "Add Reminder". Set the service type, description, due date/mileage, and reminder threshold (how many days or miles before the due date to be notified).',
  },
  {
    id: 'rem-2',
    category: 'Reminders',
    question: 'What types of reminders can I create?',
    answer: 'You can create reminders for any service type (Oil Change, Tire Rotation, Inspection, etc.). Set reminders by date, mileage, or both. You can also make reminders recurring for regular maintenance.',
  },
  {
    id: 'rem-3',
    category: 'Reminders',
    question: 'How do I know when a reminder is due?',
    answer: 'Reminders are displayed on the Reminders page with color-coded badges: Red for Overdue, Yellow for Due Soon (within threshold), Green for Upcoming. The Dashboard also shows active reminder count.',
  },
  {
    id: 'rem-4',
    category: 'Reminders',
    question: 'Can I make reminders recurring?',
    answer: 'Yes! When creating a reminder, you can enable the "Recurring" option and set an interval (in miles or months). This automatically creates a new reminder after the service is completed.',
  },

  // Reports & Analytics
  {
    id: 'ra-1',
    category: 'Reports & Analytics',
    question: 'What information is shown in Reports?',
    answer: 'Reports display: Total Spending, Average Cost per Service, Total Maintenance Records, Spending by Service Type (pie chart), Monthly Spending Trend (line chart), and Top Expensive Services (bar chart).',
  },
  {
    id: 'ra-2',
    category: 'Reports & Analytics',
    question: 'Can I filter reports by date range?',
    answer: 'Currently, reports show all-time data and monthly trends. You can view monthly spending trends in the line chart to see spending patterns over time.',
  },
  {
    id: 'ra-3',
    category: 'Reports & Analytics',
    question: 'How is spending calculated?',
    answer: 'Total spending is the sum of all maintenance costs entered. Average cost per service is total spending divided by the number of services. Both can be viewed in your preferred currency.',
  },
  {
    id: 'ra-4',
    category: 'Reports & Analytics',
    question: 'Can I export reports?',
    answer: 'Export functionality is coming soon. For now, you can take screenshots of the reports or use your browser\'s print function to save reports as PDF.',
  },

  // Settings & Preferences
  {
    id: 'sp-1',
    category: 'Settings & Preferences',
    question: 'How do I change my password?',
    answer: 'Go to Settings, scroll to the Security section, and click "Change Password". Enter your current password and the new password twice to confirm. Click Update to save.',
  },
  {
    id: 'sp-2',
    category: 'Settings & Preferences',
    question: 'What currency options are available?',
    answer: 'Fleety supports multiple currencies including USD, EUR, GBP, JPY, CAD, AUD, INR, RM (Malaysian Ringgit), and more. Change your currency preference in Settings under Preferences.',
  },
  {
    id: 'sp-3',
    category: 'Settings & Preferences',
    question: 'Can I change my email address?',
    answer: 'Yes, you can update your email in the Account section of Settings. Verify the new email address when prompted.',
  },
  {
    id: 'sp-4',
    category: 'Settings & Preferences',
    question: 'How do I enable/disable notifications?',
    answer: 'In Settings, go to the Preferences section and toggle Email Notifications and Reminder Notifications on or off based on your preference.',
  },

  // Account & Security
  {
    id: 'as-1',
    category: 'Account & Security',
    question: 'How secure is my data?',
    answer: 'Your data is encrypted and securely stored. We use industry-standard security practices including password hashing, HTTPS encryption, and regular security updates.',
  },
  {
    id: 'as-2',
    category: 'Account & Security',
    question: 'What happens if I forget my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email to reset your password.',
  },
  {
    id: 'as-3',
    category: 'Account & Security',
    question: 'Can I delete my account?',
    answer: 'Yes, you can delete your account in Settings under the Danger Zone. Be aware that this action is irreversible and will delete all your data.',
  },
  {
    id: 'as-4',
    category: 'Account & Security',
    question: 'Is my data backed up?',
    answer: 'Your data is automatically backed up on our secure servers. You can always access your data as long as your account is active.',
  },

  // Dashboard Features
  {
    id: 'df-1',
    category: 'Dashboard Features',
    question: 'What is shown on the dashboard?',
    answer: 'The Dashboard displays: Total Spending, This Month\'s Spending, Active Reminders, Recent Maintenance Records, and Quick Links to your vehicles.',
  },
  {
    id: 'df-2',
    category: 'Dashboard Features',
    question: 'How are the statistics calculated?',
    answer: 'Total Spending sums all maintenance costs. This Month\'s Spending includes records from the current calendar month. Active Reminders counts reminders marked as active.',
  },
  {
    id: 'df-3',
    category: 'Dashboard Features',
    question: 'Can I customize the dashboard?',
    answer: 'Dashboard customization features are coming soon. Currently, all widgets are displayed by default in a fixed layout.',
  },
  {
    id: 'df-4',
    category: 'Dashboard Features',
    question: 'Why is my data not updating in real-time?',
    answer: 'Data refreshes automatically when you navigate between pages. If data seems outdated, try refreshing the page or logging out and back in.',
  },

  // Troubleshooting
  {
    id: 'ts-1',
    category: 'Troubleshooting',
    question: 'The page is not loading. What should I do?',
    answer: 'Try refreshing the page using Ctrl+R or Cmd+R. Clear your browser cache and cookies, then try again. If the problem persists, try a different browser or check your internet connection.',
  },
  {
    id: 'ts-2',
    category: 'Troubleshooting',
    question: 'I cannot add a vehicle. What\'s wrong?',
    answer: 'Ensure all required fields are filled: Make, Model, Year, and Current Mileage. Check that the year is in a valid format and mileage is a number. Try again or contact support.',
  },
  {
    id: 'ts-3',
    category: 'Troubleshooting',
    question: 'My reminders are not showing up.',
    answer: 'Check if reminders are enabled in Settings > Preferences. Ensure reminders are marked as active. Go to the vehicle details and verify the reminder is properly set up.',
  },
  {
    id: 'ts-4',
    category: 'Troubleshooting',
    question: 'I\'m getting an error when logging in.',
    answer: 'Verify you\'re using the correct email and password. If you forgot your password, use the password reset feature. Ensure your browser allows cookies and JavaScript.',
  },

  // Features & Tips
  {
    id: 'ft-1',
    category: 'Features & Tips',
    question: 'What makes Fleety different from other apps?',
    answer: 'Fleety offers comprehensive vehicle maintenance tracking with beautiful UI, real-time reminders, detailed analytics, multi-vehicle support, and intuitive design. All at no cost!',
  },
  {
    id: 'ft-2',
    category: 'Features & Tips',
    question: 'How can I get the most out of Fleety?',
    answer: 'Regularly update maintenance records, set up reminders for routine services, monitor spending trends in Reports, and keep vehicle information up-to-date.',
  },
  {
    id: 'ft-3',
    category: 'Features & Tips',
    question: 'Are there any keyboard shortcuts?',
    answer: 'Currently, Fleety doesn\'t have keyboard shortcuts. We\'re working on adding them in future updates. You can navigate using the sidebar menu.',
  },
  {
    id: 'ft-4',
    category: 'Features & Tips',
    question: 'Can I use Fleety on mobile?',
    answer: 'Fleety is designed to be responsive and works on most mobile devices. While we don\'t have a dedicated mobile app yet, the web version adapts to mobile screens.',
  },
];

export function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(faqData.map((item) => item.category)));

  const filteredFAQ = faqData.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="text-gray-500 mt-1">Find answers to common questions about Fleety</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setSelectedCategory(null)}
          variant={!selectedCategory ? 'default' : 'outline'}
          className={!selectedCategory ? 'bg-black' : ''}
        >
          All Questions
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className={selectedCategory === category ? 'bg-black' : ''}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* FAQ Items - Accordion */}
      {filteredFAQ.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-start gap-3 text-left">
                      <span className="text-xs font-semibold uppercase text-black bg-gray-100 px-2 py-1 rounded flex-shrink-0 mt-0.5">
                        {item.category}
                      </span>
                      <span className="text-gray-900 font-medium">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No FAQ items found. Try adjusting your search or filter.</p>
        </div>
      )}

      {/* Contact Section */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle>Still Have Questions?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            If you couldn't find the answer you're looking for, feel free to reach out to our support team.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => (window.location.href = 'mailto:support@Fleety.example.com')}
              variant="outline"
            >
              Email Support
            </Button>
            <Button onClick={() => alert('Chat support coming soon!')} variant="outline">
              Chat Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
