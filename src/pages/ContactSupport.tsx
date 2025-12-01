import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/api/client';
import { Loader2 } from 'lucide-react';

export function ContactSupport() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeToAll, setAgreeToAll] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    if (!agreeToAll) {
      toast({ title: 'Error', description: 'You must agree to the Terms of Service, Privacy Policy, and PDPA', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      await apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, message, agreeToTermsAndPrivacy: agreeToAll, agreeToPDPA: agreeToAll }),
      });
      toast({ title: 'Success', description: 'Your message has been sent!' });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setAgreeToAll(false);
    } catch (error) {
      console.error('Error sending support message:', error);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
        <p className="text-gray-500 mt-1">Need help? Send us a message and our team will get back to you.</p>
      </div>

      {/* Contact Form */}
      <div className="flex justify-center">
        <Card className="w-full lg:w-1/4">
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
          <CardDescription>Fill in the details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <Textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            
            {/* Consent Checkbox */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreeToAll"
                  checked={agreeToAll}
                  onCheckedChange={(checked) => setAgreeToAll(checked as boolean)}
                  className="mt-1 rounded"
                />
                <Label
                  htmlFor="agreeToAll"
                  className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                >
                  I agree to the{' '}
                  <a href="/terms" className="text-gray-900 font-semibold hover:underline">
                    Terms of Service
                  </a>
                  ,{' '}
                  <a href="/privacy" className="text-gray-900 font-semibold hover:underline">
                    Privacy Policy
                  </a>
                  , and consent to Fleety processing my personal data in accordance with the{' '}
                  <a href="/pdpa" className="text-gray-900 font-semibold hover:underline">
                    PDPA
                  </a>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>

      {/* Contact Info Cards */}
      
    </div>
  );
}
